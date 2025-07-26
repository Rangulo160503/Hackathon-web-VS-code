import { Scene } from 'phaser';

export class MainGame extends Scene {
  constructor() {
    super('MainGame');
  }

  preload() {
    this.load.image('car1', 'assets/car1.png');
    this.load.image('car2', 'assets/car2.png');
    this.load.image('fondoGame', 'assets/fondo.png');
    this.load.image('child1', 'assets/nino1.png');
    this.load.image('child2', 'assets/nino2.png');
    this.load.image('child3', 'assets/nino3.png');
    this.load.image('profesora', 'assets/prof.png');
    this.load.image('btnExperiencia', 'assets/1.png');
    this.load.image('btnReintentar', 'assets/2.png');
    this.load.image('btnSalir', 'assets/3.png');
  }

  create() {
    this.esMovil = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    this.movimientoLateral = 0;

    const portal = this.scene.settings.data.portal;
    this.portalInfo = portal;

    const worldHeight = 3000;
    const worldWidth = 1024;

    const viewWidth = this.cameras.main.width;
    const viewHeight = this.cameras.main.height;

    this.add.image(0, 0, 'fondoGame')
      .setOrigin(0, 0)
      .setDisplaySize(viewWidth, viewHeight)
      .setScrollFactor(0);

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.gravity.y = 1000;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.player = this.physics.add.image(512, worldHeight - 100, 'profesora')
      .setOrigin(0.05)
      .setScale(0.05);
    this.player.body.setCollideWorldBounds(false);

    const childKeys = ['child1', 'child2', 'child3'];
    this.followers = [];

    for (let i = 0; i < 3; i++) {
      const f = this.physics.add.image(this.player.x, this.player.y + (i + 1) * 40, childKeys[i])
        .setOrigin(0.05)
        .setScale(0.05);
      f.body.setCollideWorldBounds(false);
      f.body.setAllowGravity(true);
      this.followers.push(f);
    }

    this.cameras.main.startFollow(this.player);

    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 900);
      const y = worldHeight - i * 180;
      const key = i % 2 === 0 ? 'car1' : 'car2';
      const scale = 0.15;
      const platform = this.physics.add.staticImage(x, y, key)
        .setScale(scale)
        .refreshBody();
      const adjustedWidth = platform.displayWidth * 0.5;
      const adjustedHeight = platform.displayHeight * 0.1;
      platform.body.setSize(adjustedWidth, adjustedHeight);
      platform.body.setOffset(
        (platform.displayWidth - adjustedWidth) / 2,
        (platform.displayHeight - adjustedHeight) / 2
      );
      this.platforms.add(platform);
    }

    const piso = this.add.rectangle(worldWidth / 2, worldHeight + 20, worldWidth, 40, 0x000000, 0);
    this.physics.add.existing(piso, true);
    this.platforms.add(piso);

    this.meta = this.add.zone(worldWidth / 2, 1200, worldWidth, 20);
    this.physics.add.existing(this.meta, true);

    this.physics.add.collider(this.player, this.meta, () => {
      if (!this.alcanzadoEscalon3) {
        this.alcanzadoEscalon3 = true;
        this.mostrarModalFinal();
      }
    });

    this.physics.add.collider(this.player, this.platforms, this.saltar, null, this);
    this.followers.forEach(f => this.physics.add.collider(f, this.platforms));
    this.saltar(this.player);

    this.escalonesTocados = 0;
    this.ultimoSalto = 0;
    this.alcanzadoEscalon3 = false;

    this.lastPlayerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    this.isPlayerMoving = false;

    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.esMovil) {
      this.input.on('pointerdown', (pointer) => {
        this.movimientoLateral = pointer.x < this.sys.game.config.width / 2 ? -1 : 1;
      });
      this.input.on('pointerup', () => {
        this.movimientoLateral = 0;
        this.player.body.setVelocityX(0);
      });
    }

    this.botonSalir = this.add.text(980, 20, '❌', {
      fontSize: '32px',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setInteractive().setScrollFactor(0);

    this.botonSalir.on('pointerdown', () => {
      this.scene.start('WorldMap');
    });

  }

  saltar(jugador) {
    const ahora = this.time.now;
    if (jugador.body.blocked.down && ahora - this.ultimoSalto > 100) {
      jugador.body.setVelocityY(-1000);
      this.ultimoSalto = ahora;
      this.escalonesTocados++;
      this.followers.forEach((f, i) => {
        if (f.body.blocked.down) {
          this.time.delayedCall(i * 100, () => f.body.setVelocityY(-850));
        }
      });
    }
  }

  mostrarModalFinal() {
    this.cameras.main.stopFollow();
    this.cameras.main.scrollY = 0;

    const btnVer = this.add.image(512, 300, 'btnExperiencia').setOrigin(0.5).setInteractive().setDepth(102).setScale(0.9);
    const btnReiniciar = this.add.image(512, 530, 'btnReintentar').setOrigin(0.5).setInteractive().setDepth(102).setScale(0.9);
    const btnSalir = this.add.image(512, 670, 'btnSalir').setOrigin(0.5).setInteractive().setDepth(102).setScale(0.9);

    [btnVer, btnReiniciar, btnSalir].forEach((btn, i) => {
      btn.setAlpha(0);
      this.tweens.add({ targets: btn, alpha: 1, y: '+=5', ease: 'Sine.easeInOut', duration: 400, delay: i * 100 });
    });

    btnVer.on('pointerdown', () => {
      const link = this.portalInfo?.link || 'https://example.com';
      window.open(link, '_blank');
    });
    btnReiniciar.on('pointerdown', () => this.scene.restart({ portal: this.portalInfo }));
    btnSalir.on('pointerdown', () => this.scene.start('WorldMap'));

    this.modalGroup = this.add.group([btnVer, btnReiniciar, btnSalir]);
  }

  update() {
    const speed = 200;
    if (this.esMovil) {
      this.player.body.setVelocityX(this.movimientoLateral * speed);
    } else {
      this.player.body.setVelocityX(this.cursors.left.isDown ? -speed : this.cursors.right.isDown ? speed : 0);
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
        if (dist > stopDistance) {
          this.physics.moveTo(f, tx, ty, followSpeed);
        } else {
          f.body.setVelocity(0);
        }
        tx = f.x;
        ty = f.y;
      });
    }

    if (this.player.y > this.physics.world.bounds.height + 100) {
      this.scene.restart({ portal: this.portalInfo });
    }

    const margen = 10;
    const ancho = this.physics.world.bounds.width;
    if (this.player.x < -margen) this.player.x = ancho + margen;
    if (this.player.x > ancho + margen) this.player.x = -margen;
  }
}
