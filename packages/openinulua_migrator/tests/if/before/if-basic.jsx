function Notification({ message }) {
  return (
    <div>
      {message && <p className="message">{message}</p>}
    </div>
  );
}