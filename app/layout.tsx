import { Roboto, Fira_Code } from 'next/font/google'

import "./base.css"

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})
const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${roboto.className} ${firaCode.className}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
