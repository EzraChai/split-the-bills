import { DarkModeToggle } from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="flex items-center justify-between max-w-4xl mx-auto p-4 ">
        <h1 className="text-xl font-bold savate">EVENLY</h1>
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
