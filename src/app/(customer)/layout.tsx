import CustomerNav from "@/components/custom/CustomerNav";
import '../globals.css'
import { OrderWrapper } from "@/context/orderContext";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1441970392143549"
          crossorigin="anonymous"></script>
      </head>
      <body>
        <OrderWrapper>
          <CustomerNav />
          {children}
        </OrderWrapper>
      </body>
    </html>

  )
}