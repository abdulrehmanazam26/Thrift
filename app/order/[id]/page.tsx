import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { getCustomerOrder } from "@/lib/custom-store/orders";
import { databaseConfigured } from "@/lib/custom-store/db";
import { money } from "@/lib/format";
export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stored = (await cookies()).get("thrift_last_order")?.value;
  const [cookieId, token] = stored?.split(".") || [];
  const order = databaseConfigured() && id === cookieId && token ? await getCustomerOrder(id, token) : null;
  if (!order) return <section style={{maxWidth:700,margin:"6rem auto",padding:"2rem"}}><h1>Order details unavailable.</h1><p>Please use the same browser in which you placed the order, or contact us with your order number.</p><Link href="/shop">Continue shopping →</Link></section>;
  return <section style={{maxWidth:760,margin:"5rem auto",padding:"clamp(1.5rem,5vw,4rem)",background:"#fffdf8",border:"1px solid #ddd8cc"}}>
    <p style={{color:"#ad2734",fontWeight:800,letterSpacing:".18em",fontSize:12}}>ORDER RECEIVED · CASH ON DELIVERY</p>
    <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(3rem,7vw,5rem)",fontWeight:400,letterSpacing:"-.06em"}}>It’s almost yours.</h1>
    <p>Thank you, {order.customer_name}. Your order <strong>#{order.order_number}</strong> has been received. We’ll contact you to confirm delivery in Karachi. Please pay only when your order arrives.</p>
    <div style={{borderTop:"1px solid #ddd8cc",borderBottom:"1px solid #ddd8cc",padding:"1.5rem 0",margin:"2rem 0"}}>
      {order.items.map((item: {product_title:string; quantity:number; line_total:number}, index:number) => <div key={index} style={{display:"flex",justifyContent:"space-between",gap:16}}><span>{item.product_title} × {item.quantity}</span><strong>{money(item.line_total,"PKR")}</strong></div>)}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}><span>Karachi delivery</span><strong>{money(order.delivery_fee,"PKR")}</strong></div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:22,marginTop:16}}><strong>Total due on delivery</strong><strong>{money(order.total,"PKR")}</strong></div>
    </div>
    <Link href="/shop" style={{display:"inline-block",background:"#10291e",color:"white",padding:"1rem 1.5rem",fontWeight:800}}>CONTINUE SHOPPING ↗</Link>
  </section>;
}
