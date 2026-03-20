import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BooksPage.scss";
import { api } from "../../api";
import BooksList from "../../components/BooksList";
import BookModal from "../../components/BookModal";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingBook, setEditingBook] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


 
  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    loadUser();
    // Загружаем книги при монтировании компонента
    loadBooks();
  }, []);

    const loadUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Ошибка загрузки пользователя");
      navigate("/login");
    }
  };

  // Функция загрузки книг с сервера
  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Ошибка загрузки книг:", error);
      alert("Не удалось загрузить книги");
    } finally {
      setLoading(false);
    }
  };

    const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // Открыть модалку для создания
  const openCreateModal = () => {
    setModalMode("create");
    setEditingBook(null);
    setModalOpen(true);
  };

  // Открыть модалку для редактирования
  const openEditModal = (book) => {
    setModalMode("edit");
    setEditingBook(book);
    setModalOpen(true);
  };

  // Закрыть модалку
  const closeModal = () => {
    setModalOpen(false);
    setEditingBook(null);
  };

  // Удалить книгу
  const handleDelete = async (id) => {
    const confirm = window.confirm("Вы уверены, что хотите удалить книгу?");
    if (!confirm) return;

    try {
      await api.deleteBook(id);
      setBooks(books.filter(book => book.id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить книгу");
    }
  };

  // Отправить форму (создание/редактирование)
  const handleSubmitModal = async (bookData) => {
    try {
      if (modalMode === "create") {
        const newBook = await api.createBook(bookData);
        setBooks([...books, newBook]);
      } else {
        const updatedBook = await api.updateBook(editingBook.id, bookData);
        setBooks(books.map(book => 
          book.id === updatedBook.id ? updatedBook : book
        ));
      }
      closeModal();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert("Не удалось сохранить книгу");
    }
  };

  return (
    <div className="books-page">
      <header className="header">
        <div className="container">
          <h1> Книжный магазин</h1>
          {user && (user.role === "seller" || user.role === "admin") && (
          <button className="btn btn--primary" onClick={openCreateModal}>
            Добавить книгу
          </button>
            )}
        </div>
      </header>

      <main className="main">
        <div className="container">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <BooksList
              books={books}
              onEdit={openEditModal}
              onDelete={handleDelete}
              user={user} 
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Книжный магазин. Всего книг: {books.length}
        </div>
      </footer>

      <BookModal
        open={modalOpen}
        mode={modalMode}
        initialBook={editingBook}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}