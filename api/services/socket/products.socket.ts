import { Socket } from "socket.io";
import { productsService } from "../../features/products";

function listenForProductEvents(socket: Socket) {
  socket.on("add-product-to-wishlist", async (message) => {
    console.log({ message });
    const { productId } = message;

    try {
      const wishList = await productsService.addToWishList({
        customerId: socket.data.user?._id,
        productId,
      });

      socket.emit("added-product-to-wishlist", wishList);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("add-product-to-wishlist-error", error.message);
      } else {
        socket.emit(
          "add-product-to-wishlist-error",
          "An unknown error occurred",
        );
      }
    }
  });
  socket.on("remove-product-from-wishlist", async (message) => {
    console.log({ message });
    const { productId } = message;

    try {
      const wishList = await productsService.removeFromWishList({
        customerId: socket.data.user?._id,
        productId,
      });
      console.log({ wishList });

      socket.emit("product-removed-from-wishlist", "Removed from wish list");
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("remove-product-from-wishlist-error", error.message);
      } else {
        socket.emit(
          "remove-product-from-wishlist-error",
          "An unknown error occurred",
        );
      }
    }
  });
  socket.on("check-product-is-in-wishlist", async function (message) {
    const { productId } = message;
    try {
      const isInWishList =
        await productsService.checkProductIsInCustomerWishList({
          customerId: socket.data.user?._id,
          productId,
        });
      console.log({ isInWishList });
      socket.emit("checked-if-product-in-wishlist", isInWishList);
    } catch (error: unknown) {
      if (error instanceof Error) {
        socket.emit("check-product-is-in-wishlist-error", error.message);
      } else {
        socket.emit(
          "check-product-is-in-wishlist-error",
          "An unknown error occurred",
        );
      }
    }
  });
}

export { listenForProductEvents };
