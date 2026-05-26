<template>
    <input type="text" />
</template>

<script>
    // this is fake library for sound replay
    import { playSound } from 'soundPlayer';

    // use of $el must be delayed, because element representation is not available before render
    setTimeout(()=>{
        this.$el.addListener('keyDown',()=>{
            playSound('typewritterPush');
        })

        this.$el.addListener('keyUp',()=>{
            playSound('typewritterRelease');
        })
    }, 100);
</script>