import { Scene } from 'phaser';
import { obtenerPuntos } from '../services/puntoService';

export class WorldMap extends Scene {
  constructor() {
    super('WorldMap');
  }

  preload() {
    this.load.image('mapa', 'assets/mapa.png');
  }

  create() {
    // ✅ Fondo del mapa
    const fondo = this.add.image(0, 0, 'mapa').setOrigin(0);
    fondo.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // ✅ Profesora (jugador)
    this.player = this.add.rectangle(400, 300, 32, 32, 0xffff00);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // ✅ Seguidores (niños)
    this.followers = [];
    this.dispersePositions = [];

    const colors = [0xff9999, 0x99ff99, 0x9999ff];
    for (let i = 0; i < 3; i++) {
      let follower = this.add.rectangle(400, 300 + (i + 1) * 40, 24, 24, colors[i]);
      this.physics.add.existing(follower);
      follower.body.setCollideWorldBounds(true);
      this.followers.push(follower);
      this.dispersePositions.push(new Phaser.Math.Vector2());
    }

    // ✅ Control de teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ Control táctil / mouse
    this.isTouching = false;
    this.targetX = this.player.x;
    this.targetY = this.player.y;

    this.input.on('pointerdown', (pointer) => {
      this.isTouching = true;
      this.targetX = pointer.worldX;
      this.targetY = pointer.worldY;
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isTouching) {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;
      }
    });

    this.input.on('pointerup', () => {
      this.isTouching = false;
      this.player.body.setVelocity(0);
    });

    // ✅ Para detectar si la profesora se mueve
    this.lastPlayerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.isPlayerMoving = false;

    // ✅ Portales desde API
    this.portales = this.physics.add.group();

    obtenerPuntos().then(puntos => {
      puntos.forEach(p => {
        const color = Phaser.Display.Color.RGBStringToColor(p.color).color;
        const portal = this.add.circle(p.x, p.y, 16, color);
        this.physics.add.existing(portal);
        portal.body.setImmovable(true);
        portal.setData('info', p);
        this.portales.add(portal);

        // Nombre del portal
        this.add.text(p.x - 25, p.y - 25, p.nombre, {
          fontSize: '12px',
          fill: '#fff',
          backgroundColor: '#0006',
          padding: { x: 4, y: 2 }
        });
      });

      this.physics.add.overlap(this.player, this.portales, this.entrarPortal, null, this);
    });
  }

  update() {
    let speed = 200;
    this.player.body.setVelocity(0);

    // ✅ Movimiento con teclado
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // ✅ Movimiento con toque/mouse
    if (this.isTouching) {
      this.physics.moveTo(this.player, this.targetX, this.targetY, speed);
    }

    // ✅ Detectar movimiento
    this.isPlayerMoving = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.lastPlayerPosition.x, this.lastPlayerPosition.y
    ) > 2;

    this.lastPlayerPosition.set(this.player.x, this.player.y);

    // ✅ Lógica para seguidores
    const followSpeed = speed * 0.8;
    const stopDistance = 10;
    let tx = this.player.x;
    let ty = this.player.y;

    if (this.isPlayerMoving) {
      this.followers.forEach((f, index) => {
        const dist = Phaser.Math.Distance.Between(f.x, f.y, tx, ty);
        if (dist > stopDistance) {
          this.physics.moveTo(f, tx, ty, followSpeed);
        } else {
          f.body.setVelocity(0);
        }
        tx = f.x;
        ty = f.y;
      });
    } else {
      this.followers.forEach((f, index) => {
        const angle = Phaser.Math.DegToRad(120 + index * 60);
        const offsetX = Math.cos(angle) * 80;
        const offsetY = Math.sin(angle) * 80;
        this.dispersePositions[index].set(this.player.x + offsetX, this.player.y + offsetY);

        const dist = Phaser.Math.Distance.Between(f.x, f.y, this.dispersePositions[index].x, this.dispersePositions[index].y);
        if (dist > 4) {
          this.physics.moveTo(f, this.dispersePositions[index].x, this.dispersePositions[index].y, followSpeed * 0.5);
        } else {
          f.body.setVelocity(0);
        }
      });
    }
  }

  entrarPortal(player, portal) {
    const datos = portal.getData('info');
    this.player.body.setVelocity(0);
    this.isTouching = false;

    this.scene.start('MainGame', { portal: datos });
  }
}
