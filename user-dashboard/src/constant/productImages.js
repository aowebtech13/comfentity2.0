/**
 * Resolve the image for a product.
 *
 * Products are now created by the admin and served from the backend API. Each
 * product carries its own `img`/`image` URL. If a product has no image set yet,
 * we return `null` so the UI can render a neutral placeholder instead of
 * falling back to bundled demo images.
 */
export const getProductImage = (product) => {
  if (!product) return null;

  if (product.img || product.image) {
    return product.img || product.image;
  }

  return null;
};

