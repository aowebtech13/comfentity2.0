import axiosInstance from "./axios";

const productService = {
  /**
   * Get all active products.
   * Optional params: { search, category }
   * Returns: { products: [...] }
   */
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get("/products", { params });
    return response.data;
  },

  /**
   * Get a single product by id.
   * Returns: { product: {...} }
   */
  getProduct: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },
};

export default productService;

