import { ToastContainer } from "react-toastify";
import Form from "./Form";
import Items from "./Items";

/**
 * App - Root layout component for Task Bud.
 * Composes: global toast container (bottom-right), short education copy, task form, and task list.
 * No routing; single-page layout. Section uses .section-center for width and card styling (see index.css).
 */
// Main application component - serves as the root layout
// ToastContainer provides toast notifications throughout the app (success/error messages)
const App = () => {
  return (
    <section className="section-center">
      <ToastContainer position="bottom-right" />
      <p className="education-text">
        Add tasks below. Check them off when done or remove them. Data is stored in memory on the server—refreshing may reset the list.
      </p>
      <Form />
      {/* Items component that displays the list of tasks using React Query */}
      <Items />
    </section>
  );
};
export default App;
