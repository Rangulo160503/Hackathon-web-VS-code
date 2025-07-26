import { Scene } from 'phaser';
import { obtenerPuntos } from '../services/puntoService';

export class WorldMap extends Scene {
  constructor() {
    super('WorldMap');
  }

  preload() {
    this.load.image('mapa4', 'assets/mapa4.png');
    this.load.image('portal1', 'assets/portal1.png');
    this.load.image('portal2', 'assets/portal2.png');
    this.load.image('portal3', 'assets/portal3.png');
    this.load.image('sat1', 'assets/sat1.png');
    this.load.image('sat2', 'assets/sat2.png');
    this.load.image('tor1', 'assets/tor1.png');
    this.load.image('tor2', 'assets/tor2.png');
    this.load.image('man1', 'assets/man1.png');
    this.load.audio('musica1', 'assets/audio/musica1.mp3');
    this.load.image('profesora', 'assets/prof.png');
this.load.image('child1', 'assets/nino1.png');
this.load.image('child2', 'assets/nino2.png');
this.load.image('child3', 'assets/nino3.png');

  }

  create() {
    const fondo = this.add.image(0, 0, 'mapa4').setOrigin(0);
    fondo.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Generar textura amarilla
this.player = this.physics.add.image(200, 300, 'profesora')
  .setOrigin(0.05)
  .setScale(0.05) // ⬅️ Ajustá la escala si la imagen es muy grande
  .setCollideWorldBounds(true);


    this.followers = [];
    this.dispersePositions = [];

    const childKeys = ['child1', 'child2', 'child3'];
for (let i = 0; i < 3; i++) {
  let follower = this.physics.add.image(200, 300 + (i + 1) * 40, childKeys[i])
    .setOrigin(0.05)
    .setScale(0.05)
    .setCollideWorldBounds(true);
  this.followers.push(follower);
  this.dispersePositions.push(new Phaser.Math.Vector2());
}


    this.cursors = this.input.keyboard.createCursorKeys();
    this.isTouching = false;
    this.targetX = this.player.x;
    this.targetY = this.player.y;

    this.input.on('pointerdown', pointer => {
      this.isTouching = true;
      this.targetX = pointer.worldX;
      this.targetY = pointer.worldY;
    });
    this.input.on('pointermove', pointer => {
      if (this.isTouching) {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;
      }
    });
    this.input.on('pointerup', () => {
      this.isTouching = false;
      this.player.body.setVelocity(0);
    });

    this.lastPlayerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.isPlayerMoving = false;
    this.portales = this.physics.add.group();

    obtenerPuntos().then(puntos => {
      puntos.forEach(p => {
        let portalKey = 'portal1';
        if (p.id === "2") portalKey = 'portal2';
        else if (p.id === "3") portalKey = 'portal3';

        const portal = this.physics.add.sprite(p.x, p.y, portalKey)
          .setOrigin(0.5)
          .setDisplaySize(80, 150)
          .setImmovable(true);

        portal.body.setSize(80, 150);
        portal.setData('info', p);

        this.portales.add(portal);
      });

      this.physics.add.overlap(this.player, this.portales, this.entrarPortal, null, this);
    });

    // 🛰️ Puntos decorativos
    this.puntosDecorativos = this.add.group();
    const decorativosKeys = ['sat1', 'sat2', 'tor1', 'tor2', 'man1'];

    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, this.sys.game.config.width - 50);
      const y = Phaser.Math.Between(50, this.sys.game.config.height - 50);

      const spriteKey = Phaser.Utils.Array.GetRandom(decorativosKeys);
      const decorativo = this.add.image(x, y, spriteKey).setOrigin(0.5).setScale(0.08);

      this.puntosDecorativos.add(decorativo);

      if (spriteKey.startsWith('sat')) {
        const moverSat = () => {
          const newX = Phaser.Math.Between(50, this.sys.game.config.width - 50);
          const newY = Phaser.Math.Between(50, this.sys.game.config.height - 50);
          this.tweens.add({
            targets: decorativo,
            x: newX,
            y: newY,
            duration: Phaser.Math.Between(8000, 15000),
            ease: 'Sine.easeInOut',
            onComplete: moverSat
          });
        };
        moverSat();
      } else {
        const moverAnimal = () => {
          const tiempoEspera = Phaser.Math.Between(5000, 12000);
          this.time.delayedCall(tiempoEspera, () => {
            const offsetX = Phaser.Math.Between(-20, 20);
            const offsetY = Phaser.Math.Between(-10, 10);
            const nuevoX = Phaser.Math.Clamp(decorativo.x + offsetX, 50, this.sys.game.config.width - 50);
            const nuevoY = Phaser.Math.Clamp(decorativo.y + offsetY, 50, this.sys.game.config.height - 50);
            this.tweens.add({
              targets: decorativo,
              x: nuevoX,
              y: nuevoY,
              duration: Phaser.Math.Between(1000, 2000),
              ease: 'Sine.easeInOut',
              onComplete: moverAnimal
            });
          });
        };
        moverAnimal();
      }
    }

    
  
}

  update() {
    let speed = 200;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);

    if (this.isTouching) {
      this.physics.moveTo(this.player, this.targetX, this.targetY, speed);
    }

    this.isPlayerMoving = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.lastPlayerPosition.x, this.lastPlayerPosition.y
    ) > 2;

    this.lastPlayerPosition.set(this.player.x, this.player.y);

    const followSpeed = speed * 0.8;
    const stopDistance = 10;
    let tx = this.player.x;
    let ty = this.player.y;

    if (this.isPlayerMoving) {
      this.followers.forEach((f, index) => {
        const dist = Phaser.Math.Distance.Between(f.x, f.y, tx, ty);
        if (dist > stopDistance) this.physics.moveTo(f, tx, ty, followSpeed);
        else f.body.setVelocity(0);
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
    console.log('✅ Entrando al portal:', datos);
    this.player.body.setVelocity(0);
    this.isTouching = false;
    this.scene.start('MainGame', { portal: datos });
  }
}
