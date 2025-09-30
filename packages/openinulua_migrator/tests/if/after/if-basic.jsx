function Notification({ message }) {
  return (
    <div>
      <if cond={message}>
        <p className="message">{message}</p>
      </if>
    </div>
  );
}