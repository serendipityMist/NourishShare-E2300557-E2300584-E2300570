import { Donation } from "../models/donation.model.js";
import { Food } from "../models/food.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiReponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function createNotification({ owner, title, description, notificationType }) {
    return Notification.create({
        owner,
        title,
        description,
        notificationType
    });
}


// =====================================================
// Convert Food Item to Donation
// =====================================================

const convertToDonation = asyncHandler(async (req, res) => {

    const { foodId } = req.params;

    const {
        pickUpLocation,
        availabilityTime
    } = req.body;


    // Validate required fields
    if (!pickUpLocation || !availabilityTime) {
        throw new ApiError(
            400,
            "Pickup location and availability time are required"
        );
    }


    // Find food and make sure it belongs to logged-in user
    const food = await Food.findOne({
        _id: foodId,
        owner: req.user._id
    });


    if (!food) {
        throw new ApiError(
            404,
            "Food not found or you are not authorized to donate this food"
        );
    }


    // Check food status
    if (food.status === "Donated") {
        throw new ApiError(
            400,
            "This food item has already been donated"
        );
    }


    if (food.status === "Used") {
        throw new ApiError(
            400,
            "Used food cannot be donated"
        );
    }


    // Create donation
    const donation = await Donation.create({
        expiryDate: food.expiryDate,
        pickUpLocation,
        availabilityTime,
        status: "Available",
        donor: req.user._id,
        food: food._id
    });


    // Update Food status
    food.status = "Donated";

    await food.save();

    // Create a confirmation notification for the donor
    await createNotification({
        owner: req.user._id,
        title: "Donation posted",
        description: `Your donation "${food.name}" has been posted and is available for pickup at ${pickUpLocation}.`,
        notificationType: "Donation"
    });


    return res.status(201).json(
        new ApiResponse(
            201,
            {
                donation,
                food
            },
            "Food converted to donation successfully"
        )
    );

});


// =====================================================
// Get My Donations
// =====================================================

const getMyDonations = asyncHandler(async (req, res) => {

    const donations = await Donation.find({
        donor: req.user._id
    })
    .populate({
        path: "food",
        populate: {
            path: "category"
        }
    })
    .populate("donor", "name email phone foodListingVisibility")
    .sort({ updatedAt: -1 });


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donations
            },
            donations.length
                ? "Donation listings fetched successfully"
                : "No donation listings found"
        )
    );

});


// =====================================================
// Edit Donation
// =====================================================

const editDonation = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        pickUpLocation,
        availabilityTime
    } = req.body;


    // Validate input
    if (!pickUpLocation || !availabilityTime) {
        throw new ApiError(
            400,
            "Pickup location and availability time are required"
        );
    }


    // Find donation belonging to logged-in user
    const donation = await Donation.findOne({
        _id: id,
        donor: req.user._id
    });


    if (!donation) {
        throw new ApiError(
            404,
            "Donation not found or you are not authorized to edit it"
        );
    }


    // Claimed donations should not be edited
    if (donation.status === "Claimed") {
        throw new ApiError(
            400,
            "Claimed donation cannot be edited"
        );
    }


    // Update donation
    donation.pickUpLocation = pickUpLocation;
    donation.availabilityTime = availabilityTime;


    await donation.save();


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donation
            },
            "Donation updated successfully"
        )
    );

});


// =====================================================
// Delete Donation
// =====================================================

const deleteDonation = asyncHandler(async (req, res) => {

    const { id } = req.params;


    // Find donation belonging to logged-in user
    const donation = await Donation.findOne({
        _id: id,
        donor: req.user._id
    });


    if (!donation) {
        throw new ApiError(
            404,
            "Donation not found or you are not authorized to delete it"
        );
    }


    // Claimed donation cannot be deleted
    if (donation.status === "Claimed") {
        throw new ApiError(
            400,
            "Claimed donation cannot be deleted"
        );
    }


    // Delete donation
    await Donation.findByIdAndDelete(id);


    // Change Food status back to Available
    await Food.findByIdAndUpdate(
        donation.food,
        {
            $set: {
                status: "Available"
            }
        }
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Donation deleted successfully"
        )
    );

});

const getAllDonations = asyncHandler(async (req, res) => {

    const { location, category } = req.query;

    const filter = { status: "Available" };

    if (location) {
        filter.pickUpLocation = { $regex: location, $options: "i" };
    }

    const donations = await Donation.find(filter)
    .populate({
        path: "food",
        populate: {
            path: "category"
        }
    })
    .populate("donor", "name email phone foodListingVisibility");

    let filteredDonations = donations;

    filteredDonations = donations.filter((donation) => {
        const visibility = donation.donor?.foodListingVisibility || "Community";
        return visibility !== "Private";
    });

    if (category) {
        filteredDonations = filteredDonations.filter((donation) => {
            const categoryName = donation.food?.category?.name;
            const categoryId = donation.food?.category?._id?.toString();
            return categoryName === category || categoryId === category;
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donations: filteredDonations
            },
            filteredDonations.length
                ? "Available donation listings fetched successfully"
                : "No donation listings found"
        )
    );

});

const getDonationDetails = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const donation = await Donation.findOne({
        _id: id,
        $or: [
            { status: "Available" },
            { status: "Claimed", claimedBy: req.user._id },
            { status: "Claimed", donor: req.user._id }
        ]
    })
    .populate({
        path: "food",
        populate: {
            path: "category"
        }
    })
    .populate("donor", "name email phone")
    .populate("claimedBy", "name email");


    if (!donation) {
        throw new ApiError(
            404,
            "Donation details not found"
        );
    }


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donation
            },
            "Donation details fetched successfully"
        )
    );

});

// =====================================================
// Get Donations Claimed by Current User
// =====================================================

const getMyClaimedDonations = asyncHandler(async (req, res) => {

    const donations = await Donation.find({
        claimedBy: req.user._id,
        status: "Claimed"
    })
    .populate({
        path: "food",
        populate: {
            path: "category"
        }
    })
    .populate("donor", "name email phone")
    .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donations
            },
            donations.length
                ? "Claimed donations fetched successfully"
                : "No claimed donations found"
        )
    );

});

// =====================================================
// Claim a Donation
// =====================================================

const claimDonation = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const donation = await Donation.findOne({
        _id: id,
        status: "Available"
    }).populate({
        path: "food",
        populate: { path: "category" }
    });

    if (!donation) {
        throw new ApiError(
            404,
            "Donation not found or already claimed"
        );
    }

    if (donation.donor.toString() === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot claim your own donation"
        );
    }

    donation.status = "Claimed";
    donation.claimedBy = req.user._id;

    await donation.save();

    const populatedDonation = await Donation.findById(donation._id)
        .populate({
            path: "food",
            populate: { path: "category" }
        })
        .populate("donor", "name email phone");

    const itemName = populatedDonation.food?.name || "Food item";

    await createNotification({
        owner: donation.donor,
        title: "Your donation was claimed",
        description: `"${itemName}" was claimed by ${req.user.name}.`,
        notificationType: "Donation"
    });

    await createNotification({
        owner: req.user._id,
        title: "Donation claim confirmed",
        description: `You claimed "${itemName}". Pickup at ${donation.pickUpLocation} (${donation.availabilityTime}).`,
        notificationType: "Donation"
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { donation: populatedDonation },
            "Donation claimed successfully"
        )
    );

});

const getPublicDonations = asyncHandler(async (req, res) => {

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 12);

    const donations = await Donation.find({
        status: "Available"
    })
    .populate({
        path: "food",
        populate: {
            path: "category"
        }
    })
    .populate("donor", "name email phone foodListingVisibility")
    .sort({ createdAt: -1 })
    .limit(limit * 3);

    const filteredDonations = donations
        .filter((donation) => {
            const visibility = donation.donor?.foodListingVisibility || "Community";
            return visibility !== "Private";
        })
        .slice(0, limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                donations: filteredDonations
            },
            filteredDonations.length
                ? "Public donation listings fetched successfully"
                : "No public donation listings found"
        )
    );

});

export {
    convertToDonation,
    getMyDonations,
    getMyClaimedDonations,
    getPublicDonations,
    editDonation,
    deleteDonation,
    getAllDonations,
    getDonationDetails,
    claimDonation
};
