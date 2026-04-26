export const sendChatRequest = async (text, imageBase64) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        role: 'bot',
        text: "I found the perfect pieces to complete your look! This casual outfit pairs beautifully with your charcoal vest.",
        attachedImage: null,
        timestamp: new Date().toISOString(),
        outfitRecommendation: {
          outfitId: "outfit-001",
          occasion: "Casual Weekend",
          stylistReasoning: "The crisp white tee provides a clean base layer, while the straight leg jeans add a timeless silhouette. Completed with classic white sneakers and a minimalist tote.",
          totalPriceEstimate: 145.98,
          items: {
            top: {
              productId: "t001",
              name: "Essential Cotton Crew Neck Tee",
              brand: "a.n.a",
              price: 12.99,
              imageUrl: "https://via.placeholder.com/150/ffffff/000000?text=White+Tee",
              productUrl: "#"
            },
            bottom: {
              productId: "b001",
              name: "High-Rise Straight Leg Jeans",
              brand: "Levi's",
              price: 59.99,
              imageUrl: "https://via.placeholder.com/150/003366/ffffff?text=Blue+Jeans",
              productUrl: "#"
            },
            shoes: {
              productId: "s001",
              name: "Classic Canvas Sneakers",
              brand: "Arizona",
              price: 24.99,
              imageUrl: "https://via.placeholder.com/150/ffffff/000000?text=Sneakers",
              productUrl: "#"
            },
            accessory: {
              productId: "a001",
              name: "Faux Leather Tote Bag",
              brand: "Liz Claiborne",
              price: 48.01,
              imageUrl: "https://via.placeholder.com/150/8B4513/ffffff?text=Tote+Bag",
              productUrl: "#"
            }
          }
        }
      });
    }, 2500); // 2.5 second simulated latency
  });
};
