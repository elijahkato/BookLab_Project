// src/App.jsx
import { Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBooks from "./pages/MyBooks";
import ProtectedRoute from "./components/ProtectedRoute";
import AddBook from "./pages/AddBook";
import ProfilePage from "./pages/ProfilePage";
import BookDetails from "./pages/BookDetails"; // ✅ Import the BookDetails component
import SearchPage from "./pages/SearchPage";

const App = () => {
  return (
    <>
      <ToastContainer position='top-center' autoClose={3000} />

      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/search' element={<SearchPage />} />

        {/* Book Details - public so guests can view */}
        <Route path='/books/:id' element={<BookDetails />} />

        {/* Protected routes */}
        <Route
          path='/my-books'
          element={
            <ProtectedRoute>
              <MyBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/add-book'
          element={
            <ProtectedRoute>
              <AddBook />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
