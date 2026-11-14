export const businessCategories = {
  cafe: {
    label: "Cafe & Restaurant",
    suggestions: [
      { text: "Great Coffee ☕", type: "positive" },
      { text: "Amazing Vibe ✨", type: "positive" },
      { text: "Delicious Food 🍔", type: "positive" },
      { text: "Friendly Staff 👥", type: "positive" },
      { text: "Fast Service ⚡", type: "positive" },
      { text: "Slow Service ⏳", type: "negative" }, // Negative
      { text: "Food was cold 🥶", type: "negative" }  // Negative
    ]
  },
  salon: {
    label: "Salon & Spa",
    suggestions: [
      { text: "Relaxing Massage 💆‍♀️", type: "positive" },
      { text: "Awesome Haircut ✂️", type: "positive" },
      { text: "Clean & Hygienic 🧼", type: "positive" },
      { text: "Professional Staff 👔", type: "positive" },
      { text: "Long Wait Time ⏱️", type: "negative" }, // Negative
      { text: "Unprofessional 😒", type: "negative" }  // Negative
    ]
  },
  hotel: {
    label: "Hotel & Resort",
    suggestions: [
      { text: "Comfortable Beds 🛏️", type: "positive" },
      { text: "Clean Rooms 🧹", type: "positive" },
      { text: "Great View 🌅", type: "positive" },
      { text: "Polite Staff 🛎️", type: "positive" },
      { text: "Dirty Washroom 🤢", type: "negative" }, // Negative
      { text: "Noisy Rooms 🔊", type: "negative" }    // Negative
    ]
  }
  // Baki categories bhi aise hi add kar lena...
};