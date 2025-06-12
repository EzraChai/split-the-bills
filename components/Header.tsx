import Link from "next/link";
import { DarkModeToggle } from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="flex items-center justify-between  max-w-4xl mx-auto p-4 ">
        <Link href={""} className="flex items-baseline">
          <h1 className="text-3xl antialiased font-black italic">EVENLY</h1>
          <p className="text-[9px] antialiased ">by ezrachai.</p>
        </Link>

        <nav>
          <ul>
            <li>
              <DarkModeToggle />
            </li>
          </ul>
        </nav>
      </div>
      <hr />
    </header>
  );
}
