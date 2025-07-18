import { Scene } from 'phaser';

export class MainGame extends Scene {
  constructor() {
    super('MainGame');
  }

  create() {
    this.esMovil = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    this.movimientoLateral = 0;

    const portal = this.scene.settings.data.portal;
    this.portalInfo = portal;

    const worldHeight = 3000;
    const worldWidth = 1024;

    this.add.rectangle(0, 0, worldWidth, worldHeight, 0x87ceeb).setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.gravity.y = 1000;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    this.player = this.add.rectangle(512, worldHeight - 100, 32, 32, 0xffff00).setOrigin(0.5);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(false);

    const colors = [0xff9999, 0x99ff99, 0x9999ff];
    this.followers = [];
    for (let i = 0; i < 3; i++) {
      const f = this.add.rectangle(this.player.x, this.player.y + (i + 1) * 40, 24, 24, colors[i]).setOrigin(0.5);
      this.physics.add.existing(f);
      f.body.setCollideWorldBounds(false);
      f.body.setAllowGravity(true);
      this.followers.push(f);
    }

    this.cameras.main.startFollow(this.player);

    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(100, 900);
      const y = worldHeight - i * 180;
      const platform = this.add.rectangle(x, y, 120, 20, 0x228B22);
      this.physics.add.existing(platform, true);
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
        if (pointer.x < this.sys.game.config.width / 2) {
          this.movimientoLateral = -1;
        } else {
          this.movimientoLateral = 1;
        }
      });

      this.input.on('pointerup', () => {
        this.movimientoLateral = 0;
        this.player.body.setVelocityX(0);
      });
    }
  }

  saltar(jugador) {
    const ahora = this.time.now;
    if (jugador.body.blocked.down && ahora - this.ultimoSalto > 100) {
      jugador.body.setVelocityY(-900);
      this.ultimoSalto = ahora;
      this.escalonesTocados++;

      this.followers.forEach((f, i) => {
        if (f.body.blocked.down) {
          this.time.delayedCall(i * 100, () => {
            f.body.setVelocityY(-850);
          });
        }
      });
    }
  }

  mostrarModalFinal() {
    this.cameras.main.stopFollow();
    this.cameras.main.scrollY = 0;

    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.6).setInteractive().disableInteractive();
    const modalBox = this.add.rectangle(512, 384, 400, 300, 0xffffff);
    const modalText = this.add.text(512, 320, 'Escalón 3 alcanzado', { fontSize: '22px', color: '#000' }).setOrigin(0.5);

    const btnVer = this.add.text(512, 370, 'Ver video', {
      fontSize: '20px', backgroundColor: '#00aaff', color: '#fff', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const btnReiniciar = this.add.text(512, 420, 'Reintentar', {
      fontSize: '20px', backgroundColor: '#ffaa00', color: '#fff', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const btnSalir = this.add.text(512, 470, 'Salir al mapa', {
      fontSize: '20px', backgroundColor: '#ff4444', color: '#fff', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive();

    // ✅ Compatibilidad móvil mejorada
    btnVer.on('pointerup', () => {
      setTimeout(() => {
        const link = this.portalInfo?.link || 'https://example.com';
        window.open(link, '_blank');
      }, 0);
    });

    btnReiniciar.on('pointerdown', () => this.scene.restart({ portal: this.portalInfo }));
    btnSalir.on('pointerdown', () => this.scene.start('WorldMap'));

    this.modalGroup = this.add.group([overlay, modalBox, modalText, btnVer, btnReiniciar, btnSalir]);
  }

  update() {
    const speed = 200;

    if (this.esMovil) {
      this.player.body.setVelocityX(this.movimientoLateral * speed);
    } else {
      if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(speed);
      } else {
        this.player.body.setVelocityX(0);
      }
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
