// @ts-ignore
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const api = new WooCommerceRestApi({
  url: "https://desa-wisata-bojongrangkas.biznityhub.com",
  consumerKey: process.env.WC_CONSUMER_KEY as string,
  consumerSecret: process.env.WC_CONSUMER_SECRET as string,
  version: "wc/v3"
});

// 🛠️ HELPER FUNCTIONS FOR ADMIN CRUD
export async function getProducts() {
  try {
    const response = await api.get("products", { per_page: 20 });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data produk WooCommerce:", error);
    return [];
  }
}

export async function createProduct(data: { name: string; regular_price: string; description: string }) {
  try {
    const response = await api.post("products", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Gagal menambah produk ke WooCommerce" };
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await api.delete(`products/${id}`, { force: true });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: "Gagal menghapus produk" };
  }
}