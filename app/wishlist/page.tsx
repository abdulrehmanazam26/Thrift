import { Wishlist } from "@/components/commerce/Wishlist";
export const metadata = {
  title: "Your Saved Pieces",
  robots: { index: false, follow: true },
};
export default function Page() {
  return <Wishlist />;
}
