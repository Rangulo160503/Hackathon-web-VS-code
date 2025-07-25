import { Scene } from 'phaser';

export class MusicaManager extends Scene {
  constructor() {
    super({ key: 'MusicaManager', active: true });
  }

  preload() {
    this.load.audio('musica1', 'assets/audio/musica1.mp3');
  }

  create() {
    if (!window.musicaIniciada) {
      this.musica = this.sound.add('musica1', {
        loop: true,
        volume: 0.4
      });

      // ⚠️ Requiere clic del usuario, ideal activarlo desde MainMenu
      this.musica.play();
      window.musicaIniciada = true;

      console.log('🎵 Música iniciada (una sola vez)');
    } else {
      console.log('🎵 Música ya había iniciado, no se repite');
    }

    this.scene.setVisible(false);
  }
}
