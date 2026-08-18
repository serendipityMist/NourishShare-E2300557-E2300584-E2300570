import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { mockRequest, mockResponse, flushPromises } from '../../testUtils/mockExpress.js';

const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
};
const mockUploadFileInCloudinary = jest.fn();
const mockSendMail = jest.fn();

jest.unstable_mockModule('../../models/user.models.js', () => ({ User: mockUser }));
jest.unstable_mockModule('../../utils/cloudinary.js', () => ({ uploadFileInCloudinary: mockUploadFileInCloudinary }));
jest.unstable_mockModule('../../utils/nodeMailer.js', () => ({ transporter: { sendMail: mockSendMail } }));

const {
  registerUser,
  loginUser,
  verifyLoginOTP,
  logoutUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyRegistrationOtp,
  updateProfile,
  updateAvatar,
  changePassword,
  toggleTwoFactor,
  getCurrentUser,
  updatePrivacySettings,
  resendRegistrationOtp,
} = await import('../user.controller.js');

function validRegisterBody(overrides = {}) {
  return {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password1!',
    address: '123 Main St',
    age: 25,
    phone: '0123456789',
    gender: 'Female',
    occupation: 'Engineer',
    householdSize: 2,
    malaysianResident: true,
    twoFAEnabled: false,
    ...overrides,
  };
}

function withSelect(value) {
  return { select: jest.fn().mockResolvedValue(value) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSendMail.mockResolvedValue({ messageId: 'mock-id' });
});

describe('registerUser', () => {
  it('rejects when a required text field is blank', async () => {
    const req = mockRequest({ body: validRegisterBody({ name: '' }) });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(mockUser.findOne).not.toHaveBeenCalled();
  });

  it('rejects when age/householdSize/malaysianResident/twoFAEnabled are missing', async () => {
    const req = mockRequest({ body: validRegisterBody({ age: undefined }) });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects when the email or phone is already registered', async () => {
    mockUser.findOne.mockResolvedValue({ _id: 'existing' });
    const req = mockRequest({ body: validRegisterBody() });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  it('rejects when no avatar file is provided', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: validRegisterBody(), files: {} });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when the cloudinary upload fails', async () => {
    mockUser.findOne.mockResolvedValue(null);
    mockUploadFileInCloudinary.mockResolvedValue(null);
    const req = mockRequest({
      body: validRegisterBody(),
      files: { avatar: [{ path: '/tmp/avatar.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('creates an inactive user, sends an OTP email, and returns 200 on success', async () => {
    mockUser.findOne.mockResolvedValue(null);
    mockUploadFileInCloudinary.mockResolvedValue({ url: 'http://cloudinary/avatar.png' });
    mockUser.create.mockResolvedValue({
      _id: 'newUserId',
      email: 'jane@example.com',
      name: 'Jane Doe',
      save: jest.fn().mockResolvedValue(true),
    });
    mockUser.findById.mockReturnValue(withSelect({ _id: 'newUserId', isAccountActive: false }));

    const req = mockRequest({
      body: validRegisterBody(),
      files: { avatar: [{ path: '/tmp/avatar.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockUser.create).toHaveBeenCalledWith(
      expect.objectContaining({ isAccountActive: false, avatar: 'http://cloudinary/avatar.png' })
    );
    expect(mockSendMail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('still responds 200 even if sending the verification email fails', async () => {
    mockUser.findOne.mockResolvedValue(null);
    mockUploadFileInCloudinary.mockResolvedValue({ url: 'http://cloudinary/avatar.png' });
    mockUser.create.mockResolvedValue({
      _id: 'newUserId',
      email: 'jane@example.com',
      name: 'Jane Doe',
      save: jest.fn().mockResolvedValue(true),
    });
    mockSendMail.mockRejectedValue(new Error('SMTP down'));
    mockUser.findById.mockReturnValue(withSelect({ _id: 'newUserId' }));

    const req = mockRequest({
      body: validRegisterBody(),
      files: { avatar: [{ path: '/tmp/avatar.png' }] },
    });
    const res = mockResponse();
    const next = jest.fn();

    registerUser(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('loginUser', () => {
  it('rejects when neither email nor phone is provided', async () => {
    const req = mockRequest({ body: { password: 'x' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects when password is missing', async () => {
    const req = mockRequest({ body: { email: 'jane@example.com' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the user does not exist', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'jane@example.com', password: 'x' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when the password does not match', async () => {
    mockUser.findOne.mockResolvedValue({
      isPasswordCorrect: jest.fn().mockResolvedValue(false),
    });
    const req = mockRequest({ body: { email: 'jane@example.com', password: 'wrong' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (403) when the account has not been activated', async () => {
    mockUser.findOne.mockResolvedValue({
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
      isAccountActive: false,
    });
    const req = mockRequest({ body: { email: 'jane@example.com', password: 'right' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('logs in directly and sets cookies when 2FA is disabled', async () => {
    const userDoc = {
      _id: 'u1',
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
      isAccountActive: true,
      twoFAEnabled: false,
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findOne.mockResolvedValue(userDoc);
    mockUser.findById.mockImplementation((id) => {
      if (id === 'u1') return userDoc; // used inside generateAccessAndRefreshToken
      return withSelect({ _id: 'u1' });
    });
    // generateAccessAndRefreshToken re-fetches by id and expects a plain user doc
    mockUser.findById.mockReturnValueOnce(userDoc).mockReturnValueOnce(withSelect({ _id: 'u1' }));

    const req = mockRequest({ body: { email: 'jane@example.com', password: 'right' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('sends a login OTP and does not set cookies when 2FA is enabled', async () => {
    const userDoc = {
      _id: 'u2',
      name: 'Jane',
      email: 'jane@example.com',
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
      isAccountActive: true,
      twoFAEnabled: true,
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findOne.mockResolvedValue(userDoc);

    const req = mockRequest({ body: { email: 'jane@example.com', password: 'right' } });
    const res = mockResponse();
    const next = jest.fn();

    loginUser(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(userDoc.otp).toHaveLength(6);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('verifyLoginOTP', () => {
  it('rejects (400) when otp is missing', async () => {
    const req = mockRequest({ body: { email: 'a@a.com' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the user is not found', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when 2FA is not enabled for the user', async () => {
    mockUser.findOne.mockResolvedValue({ twoFAEnabled: false });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (401) when the OTP has expired', async () => {
    mockUser.findOne.mockResolvedValue({
      twoFAEnabled: true,
      otpExpiry: Date.now() - 1000,
      otp: '123456',
    });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('rejects (401) when the OTP does not match', async () => {
    mockUser.findOne.mockResolvedValue({
      twoFAEnabled: true,
      otpExpiry: Date.now() + 60000,
      otp: '111111',
    });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '999999' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('logs the user in and sets cookies on a correct, unexpired OTP', async () => {
    const userDoc = {
      _id: 'u3',
      twoFAEnabled: true,
      otpExpiry: Date.now() + 60000,
      otp: '111111',
      generateAccessToken: jest.fn().mockResolvedValue('access-token'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findOne.mockResolvedValue(userDoc);
    mockUser.findById.mockReturnValueOnce(userDoc).mockReturnValueOnce(withSelect({ _id: 'u3' }));

    const req = mockRequest({ body: { email: 'a@a.com', otp: '111111' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyLoginOTP(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.isOtpVerified).toBe(true);
    expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('logoutUser', () => {
  it('clears auth cookies and returns 200', async () => {
    mockUser.findByIdAndUpdate.mockResolvedValue({});
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    logoutUser(req, res, next);
    await flushPromises();

    expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { $set: { refreshToken: undefined } },
      { new: true }
    );
    expect(res.cookie).toHaveBeenCalledWith('accessToken', '', expect.objectContaining({ maxAge: 0 }));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('forgotPassword', () => {
  it('rejects (500, wrapped) when neither email nor phone is given', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();
    const next = jest.fn();

    forgotPassword(req, res, next);
    await flushPromises();

    // The handler's own try/catch re-wraps any thrown ApiError as a 500.
    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('rejects (500, wrapped) when the user does not exist', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'ghost@example.com' } });
    const res = mockResponse();
    const next = jest.fn();

    forgotPassword(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('sends a reset OTP and returns 200 for an existing user', async () => {
    mockUser.findOne.mockResolvedValue({ name: 'Jane', email: 'jane@example.com' });
    const req = mockRequest({ body: { email: 'jane@example.com' } });
    const res = mockResponse();
    const next = jest.fn();

    forgotPassword(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('verifyOTP', () => {
  it('rejects (400) when email/phone missing', async () => {
    const req = mockRequest({ body: { otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (404) when the user is not found', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('rejects (400) when no registration OTP was ever requested', async () => {
    mockUser.findOne.mockResolvedValue({ registrationOtp: null });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when the registration OTP has expired', async () => {
    mockUser.findOne.mockResolvedValue({
      registrationOtp: '123456',
      registrationOtpExpiry: new Date(Date.now() - 1000),
    });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '123456' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (400) when the OTP does not match', async () => {
    mockUser.findOne.mockResolvedValue({
      registrationOtp: '111111',
      registrationOtpExpiry: new Date(Date.now() + 60000),
    });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '999999' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('activates the account on a correct OTP', async () => {
    const userDoc = {
      registrationOtp: '111111',
      registrationOtpExpiry: new Date(Date.now() + 60000),
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findOne.mockResolvedValue(userDoc);
    const req = mockRequest({ body: { email: 'a@a.com', otp: '111111' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyOTP(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.isAccountActive).toBe(true);
    expect(userDoc.registrationOtp).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('resetPassword', () => {
  it('rejects (500, wrapped) when neither email nor phone is given', async () => {
    const req = mockRequest({ body: { password: 'newPass1!' } });
    const res = mockResponse();
    const next = jest.fn();

    resetPassword(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('rejects (500, wrapped) when the user has not verified OTP first', async () => {
    mockUser.findOne.mockResolvedValue({ isOtpVerified: false });
    const req = mockRequest({ body: { email: 'a@a.com', password: 'newPass1!' } });
    const res = mockResponse();
    const next = jest.fn();

    resetPassword(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('updates the password when OTP has been verified', async () => {
    const userDoc = { isOtpVerified: true, save: jest.fn().mockResolvedValue(true) };
    mockUser.findOne.mockResolvedValue(userDoc);
    const req = mockRequest({ body: { email: 'a@a.com', password: 'newPass1!' } });
    const res = mockResponse();
    const next = jest.fn();

    resetPassword(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.password).toBe('newPass1!');
    expect(userDoc.isOtpVerified).toBe(false);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('verifyRegistrationOtp', () => {
  it('rejects (401) on incorrect OTP', async () => {
    mockUser.findOne.mockResolvedValue({
      registrationOtp: '111111',
      registrationOtpExpiry: { getTime: () => Date.now() + 60000 },
    });
    const req = mockRequest({ body: { email: 'a@a.com', otp: '000000' } });
    const res = mockResponse();
    const next = jest.fn();

    verifyRegistrationOtp(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('activates the account and applies the chosen 2FA preference', async () => {
    const userDoc = {
      registrationOtp: '111111',
      registrationOtpExpiry: { getTime: () => Date.now() + 60000 },
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findOne.mockResolvedValue(userDoc);
    mockUser.findById.mockReturnValue(withSelect({ _id: 'u1', isAccountActive: true }));

    const req = mockRequest({ body: { email: 'a@a.com', otp: '111111', twoFAEnabled: true } });
    const res = mockResponse();
    const next = jest.fn();

    verifyRegistrationOtp(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.isAccountActive).toBe(true);
    expect(userDoc.twoFAEnabled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('updateProfile', () => {
  it('rejects (409) when changing to an email already used by another user', async () => {
    mockUser.findById.mockResolvedValue({ _id: 'u1', email: 'old@example.com' });
    mockUser.findOne.mockResolvedValue({ _id: 'other-user' });
    const req = mockRequest({ user: { _id: 'u1' }, body: { email: 'taken@example.com' } });
    const res = mockResponse();
    const next = jest.fn();

    updateProfile(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  it('updates allowed fields and returns the sanitized user', async () => {
    const userDoc = { _id: 'u1', email: 'old@example.com', save: jest.fn().mockResolvedValue(true) };
    // 1st findById call loads req.user; 2nd builds the sanitized response.
    mockUser.findById.mockResolvedValueOnce(userDoc);
    mockUser.findById.mockReturnValueOnce(withSelect({ _id: 'u1', name: 'New Name' }));

    const req = mockRequest({ user: { _id: 'u1' }, body: { name: 'New Name' } });
    const res = mockResponse();
    const next = jest.fn();

    updateProfile(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.name).toBe('New Name');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('updateAvatar', () => {
  it('rejects (400) when no avatar file is uploaded', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, files: {} });
    const res = mockResponse();
    const next = jest.fn();

    updateAvatar(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (500) when the cloudinary upload fails', async () => {
    mockUploadFileInCloudinary.mockResolvedValue(null);
    const req = mockRequest({ user: { _id: 'u1' }, files: { avatar: [{ path: '/tmp/a.png' }] } });
    const res = mockResponse();
    const next = jest.fn();

    updateAvatar(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('updates the avatar URL on success', async () => {
    mockUploadFileInCloudinary.mockResolvedValue({ secure_url: 'https://cdn/avatar2.png' });
    mockUser.findByIdAndUpdate.mockReturnValue(withSelect({ _id: 'u1', avatar: 'https://cdn/avatar2.png' }));

    const req = mockRequest({ user: { _id: 'u1' }, files: { avatar: [{ path: '/tmp/a.png' }] } });
    const res = mockResponse();
    const next = jest.fn();

    updateAvatar(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('changePassword', () => {
  it('rejects (400) when a field is missing', async () => {
    const req = mockRequest({ user: { _id: 'u1' }, body: { oldPassword: 'a' } });
    const res = mockResponse();
    const next = jest.fn();

    changePassword(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (401) when the old password is wrong', async () => {
    mockUser.findById.mockResolvedValue({
      isPasswordCorrect: jest.fn().mockResolvedValue(false),
    });
    const req = mockRequest({ user: { _id: 'u1' }, body: { oldPassword: 'wrong', newPassword: 'new' } });
    const res = mockResponse();
    const next = jest.fn();

    changePassword(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('updates the password on success', async () => {
    const userDoc = {
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findById.mockResolvedValue(userDoc);
    const req = mockRequest({ user: { _id: 'u1' }, body: { oldPassword: 'old', newPassword: 'new' } });
    const res = mockResponse();
    const next = jest.fn();

    changePassword(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.password).toBe('new');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('toggleTwoFactor', () => {
  it('rejects (404) when the user cannot be found', async () => {
    mockUser.findById.mockResolvedValueOnce(null);
    const req = mockRequest({ user: { _id: 'ghost' } });
    const res = mockResponse();
    const next = jest.fn();

    toggleTwoFactor(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('flips twoFAEnabled and returns the updated user', async () => {
    const userDoc = { twoFAEnabled: false, save: jest.fn().mockResolvedValue(true) };
    mockUser.findById.mockResolvedValueOnce(userDoc);
    mockUser.findById.mockReturnValueOnce(withSelect({ twoFAEnabled: true }));

    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    toggleTwoFactor(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.twoFAEnabled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('getCurrentUser', () => {
  it('rejects (404) when the user cannot be found', async () => {
    mockUser.findById.mockReturnValue(withSelect(null));
    const req = mockRequest({ user: { _id: 'ghost' } });
    const res = mockResponse();
    const next = jest.fn();

    getCurrentUser(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('returns the current sanitized user on success', async () => {
    mockUser.findById.mockReturnValue(withSelect({ _id: 'u1', name: 'Jane' }));
    const req = mockRequest({ user: { _id: 'u1' } });
    const res = mockResponse();
    const next = jest.fn();

    getCurrentUser(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('updatePrivacySettings', () => {
  it('rejects (400) for an invalid visibility value', async () => {
    mockUser.findById.mockResolvedValue({ _id: 'u1' });
    const req = mockRequest({ user: { _id: 'u1' }, body: { foodListingVisibility: 'Everyone' } });
    const res = mockResponse();
    const next = jest.fn();

    updatePrivacySettings(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('updates visibility and 2FA preference on success', async () => {
    const userDoc = { _id: 'u1', save: jest.fn().mockResolvedValue(true) };
    mockUser.findById.mockResolvedValueOnce(userDoc);
    mockUser.findById.mockReturnValueOnce(withSelect({ foodListingVisibility: 'Private' }));

    const req = mockRequest({
      user: { _id: 'u1' },
      body: { foodListingVisibility: 'Private', twoFAEnabled: true },
    });
    const res = mockResponse();
    const next = jest.fn();

    updatePrivacySettings(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.foodListingVisibility).toBe('Private');
    expect(userDoc.twoFAEnabled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('resendRegistrationOtp', () => {
  it('rejects (400) when the account is already active', async () => {
    mockUser.findOne.mockResolvedValue({ isAccountActive: true });
    const req = mockRequest({ body: { email: 'a@a.com' } });
    const res = mockResponse();
    const next = jest.fn();

    resendRegistrationOtp(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects (500) when sending the new OTP email fails', async () => {
    mockUser.findOne.mockResolvedValue({
      isAccountActive: false,
      save: jest.fn().mockResolvedValue(true),
    });
    mockSendMail.mockRejectedValue(new Error('smtp fail'));
    const req = mockRequest({ body: { email: 'a@a.com' } });
    const res = mockResponse();
    const next = jest.fn();

    resendRegistrationOtp(req, res, next);
    await flushPromises();

    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it('generates and sends a new OTP for an inactive account', async () => {
    const userDoc = { isAccountActive: false, save: jest.fn().mockResolvedValue(true) };
    mockUser.findOne.mockResolvedValue(userDoc);
    const req = mockRequest({ body: { email: 'a@a.com' } });
    const res = mockResponse();
    const next = jest.fn();

    resendRegistrationOtp(req, res, next);
    await flushPromises();

    expect(next).not.toHaveBeenCalled();
    expect(userDoc.registrationOtp).toHaveLength(6);
    expect(mockSendMail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
