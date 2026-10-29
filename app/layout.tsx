import type {Metadata} from 'next'; import './globals.css';
export const metadata:Metadata={title:'TS-HURT | Feelings Sold Separately',description:'An underground print operation. Uncomfortably original apparel.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
