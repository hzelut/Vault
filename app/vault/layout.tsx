import "./style.css"

export default function VaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<>
    <nav>
      <ul>
        <li><a href='/vault'>H</a></li>
        <li><a href='/vault/todo'>T</a></li>
      </ul>
    </nav>
    <main>
      {children}
    </main>
  </>);
}
