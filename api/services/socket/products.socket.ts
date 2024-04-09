import { Socket } from "socket.io";
import { productsService } from "../../features/products";

function listenForProductEvents(socket: Socket) {
  socket.on("add-product-to-wishlist", async (message) => {
    console.log({ message });
    const { customerId, productId } = message;

    try {
      const wishList = await productsService.addToWishList({
        customerId,
        productId,
      });

      socket.emit("added-product-to-wishlist", "Added to wish list");
    } catch (error: any) {
      socket.emit("add-product-to-wishlist-error", error.message);
    }
  });

  socket.on("remove-product-from-wishlist", async (message) => {
    console.log({ message });
    const { customerId, productId } = message;

    try {
      const wishList = await productsService.removeFromWishList({
        customerId,
        productId,
      });
      console.log({ wishList });

      socket.emit("product-removed-from-wishlist", "Removed from wish list");
    } catch (error: any) {
      socket.emit("remove-product-from-wishlist-error", error.message);
    }
  });
}

export { listenForProductEvents };
