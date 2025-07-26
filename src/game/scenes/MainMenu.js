import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const bg = this.add.image(0, 0, 'background').setOrigin(0);
bg.setDisplaySize(this.scale.width, this.scale.height);

const musica = this.sound.add('musica2', {
        loop: true,
        volume: 0.5
    });
        
musica.play();
        this.input.once('pointerdown', () => {

            this.scene.start('WorldMap');

        });
    }
}
