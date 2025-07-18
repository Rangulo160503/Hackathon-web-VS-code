import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { WorldMap } from './scenes/WorldMap';
import { MainGame } from './scenes/MainGame';
import { GameOver } from './scenes/GameOver';
import { AUTO, Game, Physics } from 'phaser';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        WorldMap,   //  Mapa con portales
        MainGame,   //  Minijuego
        GameOver
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
};

export default StartGame;
