export const businessCategories = {
  cafe: {
    label: "Cafe & Restaurant",
    suggestions: [
      { text: "Great Coffee ☕", type: "positive" },
      { text: "Amazing Vibe ✨", type: "positive" },
      { text: "Delicious Food 👌", type: "positive" },
      { text: "Friendly Staff 👥", type: "positive" },
      { text: "Best Experience 😃", type: "positive" },
      { text: "Bad Experience ⏳", type: "negative" },
      
    ],
    ratingCategories: ["Food", "Service", "Atmosphere"],
    
    // 🌟 NAYA: Seedhe dikhne wale questions (Bina dropdown ke)
    directQuestions: [
      { 
        id: "meal", 
        question: "What did you get?", 
        multiSelect: false,
        options: ["Breakfast", "Brunch", "Lunch", "Dinner", "Other"] 
      },
      { 
        id: "spend", 
        question: "How much did you spend per person?", 
        multiSelect: false,
        options: ["₹1-200", "₹200-400", "₹400-600", "₹600-800", "₹800-1,000", "₹1,000-1,200", "₹1,200-1,400", "₹1,400-1,600", "₹1,600-1,800", "₹1,800-2,000", "₹2,000+"] 
      },
      { 
        id: "wait", 
        question: "How long did you wait for a table?", 
        multiSelect: false,
        options: ["No wait", "Up to 10 min", "10-30 min", "30-60 min", "1+ hour"] 
      },
      { 
        id: "group", 
        question: "What size group is this place best suited for?", 
        subtext: "(Select all that apply)", 
        multiSelect: true,
        options: ["1 person", "2 people", "3-4 people", "5-8 people", "9+ people", "Suitable for all group sizes", "Not sure"] 
      }
    ],

    // 🌟 NAYA: "Add more details to help others" wale Dropdowns
    accordionSections: [
      {
        id: "veg",
        title: "Vegetarian options",
        questions: [
          { id: "veg_rec", question: "Would you recommend this place to vegetarians?", multiSelect: false, options: ["Highly recommend", "Somewhat recommend", "Would not recommend", "Not sure"] },
          { id: "veg_desc", question: "How would you describe the vegetarian offerings?", subtext: "(Select all that apply)", multiSelect: true, options: ["Menu is all vegetarian", "Large vegetarian selection", "Vegetarian menu or section", "Clearly labelled vegetarian dishes", "Not sure"] }
        ],
        textAreaPlaceholder: "Tell others about vegetarian options"
      },
      {
        id: "diet",
        title: "Dietary restrictions",
        questions: [], // Isme options nahi hain, sirf text area hai
        textAreaPlaceholder: "Tell others about options for dietary restrictions"
      },
      {
        id: "parking",
        title: "Parking",
        questions: [
          { id: "park_how", question: "How is the parking here?", multiSelect: false, options: ["Plenty of parking", "Somewhat difficult to find parking", "Difficult to find parking", "Not sure"] },
          { id: "park_opt", question: "What parking options are available?", subtext: "(Select all that apply)", multiSelect: true, options: ["Free of charge parking lot", "Paid parking lot", "Free of charge street parking", "Paid street parking", "Valet", "Free of charge parking garage", "Paid parking garage", "Parking is unavailable"] }
        ],
        textAreaPlaceholder: "Location, number of spots and more"
      },
      {
        id: "kids",
        title: "Kid-friendliness",
        questions: [],
        textAreaPlaceholder: "Tell others about kid-friendliness"
      },
      {
        id: "wheelchair",
        title: "Wheelchair accessibility",
        questions: [],
        textAreaPlaceholder: "Tell others about wheelchair accessibility"
      }
    ]
  },
  hotel: {
    label: "Hotel, Resort & Airbnb",
    suggestions: [
      { text: "Comfortable Beds 🛏️", type: "positive" },
      { text: "Clean Rooms 🧹", type: "positive" },
      { text: "Great View 🌅", type: "positive" },
      { text: "Polite Staff 🛎️", type: "positive" },
      { text: "Tasty Breakfast 🍳", type: "positive" },
      { text: "Dirty Washrooms 🤢", type: "negative" },
      { text: "Noisy Rooms 🔊", type: "negative" },
      { text: "Bad Room Service 📞", type: "negative" }
    ],
    // 🌟 Google Maps Hotels Rating System
    ratingCategories: ["Rooms", "Service", "Location"],
    
    // 🌟 Direct Questions for Hotels
    directQuestions: [
      { 
        id: "trip_type", 
        question: "What type of trip was this?", 
        multiSelect: false,
        options: ["Holiday", "Business", "Couples", "Solo", "Family", "Friends"] 
      }
    ],

    // 🌟 Detailed Accordions for Hotels
    accordionSections: [
      {
        id: "rooms_details",
        title: "Rooms",
        questions: [
          { 
            id: "room_desc", 
            question: "How would you describe the rooms?", 
            subtext: "(Select all that apply)", 
            multiSelect: true, 
            options: ["Clean", "Spacious", "Quiet", "Updated", "Small", "Dated", "Noisy"] 
          }
        ],
        textAreaPlaceholder: "Tell others about the rooms"
      },
      {
        id: "food_drink",
        title: "Food & drink",
        questions: [
          { 
            id: "hotel_food", 
            question: "How was the food?", 
            subtext: "(Select all that apply)", 
            multiSelect: true, 
            options: ["Great breakfast", "Good room service", "Nice restaurant/bar", "Limited options"] 
          }
        ],
        textAreaPlaceholder: "Tell others about the food and drinks"
      },
      {
        id: "hotel_amenities",
        title: "Amenities",
        questions: [
          { 
            id: "amenities_desc", 
            question: "What amenities did you use?", 
            subtext: "(Select all that apply)", 
            multiSelect: true, 
            options: ["Swimming pool", "Gym/Fitness center", "Spa", "Free Wi-Fi", "Parking"] 
          }
        ],
        textAreaPlaceholder: "Tell others about the hotel amenities"
      }
    ]
  }
};