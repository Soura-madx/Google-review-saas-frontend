export const businessCategories = {
  cafe: {
    label: "Cafe & Restaurant",
    ratingCategories: ["Food", "Service", "Atmosphere"], // As seen in your screenshot
    detailedQuestions: [
      {
        id: "meal_type",
        question: "What did you get?",
        options: ["Breakfast", "Brunch", "Lunch", "Dinner", "Other"]
      },
      {
        id: "spend",
        question: "How much did you spend per person?",
        options: ["₹1-200", "₹200-400", "₹400-600", "₹600-800", "₹800+"]
      }
    ],
    suggestions: [
      { text: "Great Coffee ☕", type: "positive" },
      { text: "Delicious Food 🍔", type: "positive" },
      { text: "Slow Service ⏳", type: "negative" }
    ]
  },
  salon: {
    label: "Salon & Spa",
    ratingCategories: ["Service Quality", "Cleanliness", "Staff Behavior"],
    detailedQuestions: [
       {
        id: "service_type",
        question: "What service did you get?",
        options: ["Haircut", "Coloring", "Facial", "Massage", "Other"]
      }
    ],
    suggestions: [
      { text: "Awesome Haircut ✂️", type: "positive" },
      { text: "Clean & Hygienic 🧼", type: "positive" },
      { text: "Long Wait Time ⏱️", type: "negative" }
    ]
  }
};