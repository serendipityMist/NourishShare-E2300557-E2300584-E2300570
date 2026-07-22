import { Router } from "express";

import {
    convertToDonation,
    getMyDonations,
    getMyClaimedDonations,
    getPublicDonations,
    editDonation,
    deleteDonation,
    getAllDonations,
    getDonationDetails,
    claimDonation
} from "../controllers/donation.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publicDonations").get(getPublicDonations);

router.route("/convertToDonation/:foodId").post(
    verifyJWT,
    convertToDonation
);

router.route("/myDonations").get(
    verifyJWT,
    getMyDonations
);

router.route("/myClaims").get(
    verifyJWT,
    getMyClaimedDonations
);


router.route("/getAllDonations").get(
    verifyJWT,
    getAllDonations
);


router.route("/getDonationDetails/:id").get(
    verifyJWT,
    getDonationDetails
);


router.route("/editDonation/:id").put(
    verifyJWT,
    editDonation
);

router.route("/deleteDonation/:id").delete(
    verifyJWT,
    deleteDonation
);

router.route("/claimDonation/:id").patch(
    verifyJWT,
    claimDonation
);


export default router;
