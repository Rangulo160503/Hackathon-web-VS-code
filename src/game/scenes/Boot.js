import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/open.png');
        this.load.audio('musica1', 'assets/audio/himCR1.mp3');
        this.load.audio('musica2', 'assets/audio/pok1.mp3');
        this.load.audio('musica3', 'assets/audio/kirb1.mp3');
    }

    create ()
    {
        this.scene.start('Preloader');

    }
}
