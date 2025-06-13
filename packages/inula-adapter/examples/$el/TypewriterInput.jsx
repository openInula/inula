import { playSound } from 'soundPlayer1';
import { useInstance } from 'vue-horizon';

export default function (props) {
  const instance = useInstance();
  //use of $el must be delayed, because element representation is not available before render
  setTimeout(() => {
    instance.$el.addListener('keyDown', () => {
      playSound('typewritterPush');
    });

    instance.$el.addListener('keyUp', () => {
      playSound('typewritterRelease');
    });
  }, 100);

  return <input type="text" />;
}
