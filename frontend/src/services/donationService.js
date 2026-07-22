import api from "../lib/axios";

export const donationService = {
  // ==========================
  // Convert Food to Donation
  // ==========================

  convertToDonation: (foodId, payload) =>
    api.post(`/donation/convertToDonation/${foodId}`, payload),

  // ==========================
  // Get My Donations
  // ==========================

  getMyDonations: () =>
    api.get("/donation/myDonations"),

  getMyClaimedDonations: () =>
    api.get("/donation/myClaims"),

  getPublicDonations: (params) =>
    api.get("/donation/publicDonations", { params }),

  // ==========================
  // Get All Available Donations
  // ==========================

  getAllDonations: (params) =>
    api.get("/donation/getAllDonations", { params }),

  // ==========================
  // Get Donation Details
  // ==========================

  getDonationDetails: (id) =>
    api.get(`/donation/getDonationDetails/${id}`),

  // ==========================
  // Edit Donation
  // ==========================

  editDonation: (id, payload) =>
    api.put(`/donation/editDonation/${id}`, payload),

  // ==========================
  // Delete Donation
  // ==========================

  deleteDonation: (id) =>
    api.delete(`/donation/deleteDonation/${id}`),

  // ==========================
  // Claim Donation (persists to DB)
  // ==========================

  claimDonation: (id) =>
    api.patch(`/donation/claimDonation/${id}`),
};
