import { animationLogic } from './scripts/animationLogic';
import { scorer } from './scripts/scoring';
import { UserbaseService } from 'src/app/services/userbase.service';
import { ChartopiaService } from './../../services/chartopia.service';
import { Component, OnInit} from '@angular/core';
import * as PIXI from 'pixi.js';
import { enemy } from './scripts/commonEnemy';
import { AuthService } from 'src/app/services/auth.service';
import { player } from './scripts/player';
import { endTitleStyle, enemyTurnTitle, getRandomName, mainTitleStyle, nameplateStyle, playerTurnTitle, turnTitleStyle, selectednameplateStyle  } from './scripts/randomNameGenerator';
import {actionIcons, backgrounds, chartNumber, enemyActions, menuButtons, playerActions } from 'src/app/enums/enums';
import {Howl, Howler} from 'howler';
import { backgroundClass } from './scripts/background';
import { fightMenuClass } from './scripts/fightMenu';
import { healthbar } from './scripts/healthbarLogic';
import { soundEffect } from './scripts/soundLogic';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit{

  private scoring: scorer;

  constructor(private chartopia: ChartopiaService, private auth: AuthService, private userbase: UserbaseService){
    this.scoring = new scorer(auth,userbase);

  }
  gameNotAvailable:boolean=false;
  private app: PIXI.Application<HTMLCanvasElement> = new PIXI.Application({});
  private animationLogic = new animationLogic(this.app);
  private loadScreen = new PIXI.Graphics();
  private player: player;
  private score = 0;
  private stageNum=1;
  private difficulty:number; ///0,75 - 1.00 - 1,25
  private playerHealthBar:healthbar = new healthbar();
  private sounds = new soundEffect()
  private levelName: PIXI.Text = new PIXI.Text('',nameplateStyle)
  private levelNumber = 1;
  private mainMenuOst = new Howl({
      src: ['/assets/music/mainmenuost.mp3',],
      volume: 0.05, // ajusta el volumen según sea necesario
  });
  private battleOst = new Howl({
    src: ['/assets/music/battleost1.mp3',
          '/assets/music/battleost2.mp3',
          '/assets/music/battleost3.mp3',
        ],
    volume: 0.05, // ajusta el volumen según sea necesario
});
  ngOnInit(): void {
    document.getElementById('window')!.appendChild(this.app.view);

    //Loading screen for transitions
    this.loadScreen.beginFill(0x000000,1);
    this.loadScreen.drawRect(0, 0, 800, 600); 
    this.loadScreen.endFill();
    
    //Begin game
    this.startScreen()
    
  }
  
  ngOnDestroy(): void {
    // Este método se llama cuando el componente se destruye, es un buen lugar para limpiar recursos
    this.mainMenuOst.stop();
    this.battleOst.stop();
  }

  //GAME SCREENS

  /**
   * Main title screen of the game
   */
  async startScreen(){
    
   
    //Add background image
  
    //Adds main title
    let title = new PIXI.Text('The Path of Nuala',mainTitleStyle);
    this.mainMenuOst.play()
    title.anchor.set(0.5);
    title.position.set(400,200)

    //Adds subtitle
    let subtitle = new PIXI.Text('Click to Start',nameplateStyle)
    subtitle.anchor.set(0.5);
    subtitle.position.set(title.x,title.y + 100)

    //Renders scene and animations
    this.app.stage.addChild(title,subtitle)
    this.app.stage.render
    this.animationLogic.faddingText(title,0.005);
    this.animationLogic.faddingText(subtitle,0.003);
    
    //Transitions logic with loading screen
    this.app.stage.eventMode = 'static'
    this.app.stage.addEventListener('click', async() =>{
      this.app.stage.eventMode = 'none'
      await this.loadScreenOut()
      this.createCharacterScreen()
    })
    
  }

  /**
   * Character creation screen
   */
  async createCharacterScreen() {
    
    // Title for the character creation screen
    this.app.stage.eventMode = 'static';
    const title = new PIXI.Text('Character Creation', mainTitleStyle);
    title.anchor.set(0.5);
    title.position.set(400, 50);
    const startGameButton = this.createButton('Start Game', 400, 550);
    // Text to choose the difficulty
    const difficultyLabel = new PIXI.Text('Choose your difficulty:', nameplateStyle);
    difficultyLabel.anchor.set(0.5);
    difficultyLabel.position.set(400,200);
    const nameLabel = new PIXI.Text('Enter your name:', nameplateStyle);
    nameLabel.anchor.set(0.5);
    nameLabel.position.set(400,400);
  const inputText = new PIXI.Text('', nameplateStyle);
  inputText.x = 400;
  inputText.y = 450;
  inputText.anchor.set(0.5);
  this.app.stage.addChild(inputText);
  let nombrePersonaje: string = '';
  let nombreClase: string = '';
// Input text para el nombre

window.addEventListener('keydown', (event) => {
  if (event.key.length === 1) {
    inputText.text += event.key;
    nombrePersonaje += event.key; // Actualizar la variable al agregar caracteres
  } else if (event.key === 'Backspace') {
    inputText.text = inputText.text.slice(0, -1);
    nombrePersonaje = nombrePersonaje.slice(0, -1); // Actualizar la variable al borrar caracteres
  }
});
    // Botones para la dificultad
    const easyButton = this.createButton('Easy', title.x - 100, title.y + 200);
    const normalButton = this.createButton('Normal', title.x, title.y + 200);
    const hardButton = this.createButton('Hard', title.x + 100, title.y + 200);
  
    // Eventos para la dificultad
    easyButton.on('click', () => {
      this.difficulty = 0.75;
      easyButton.style = selectednameplateStyle;
      normalButton.style = nameplateStyle;
      hardButton.style = nameplateStyle;

    });
    
    normalButton.on('click', () => {
      this.difficulty = 1;
      easyButton.style = nameplateStyle;
      normalButton.style = selectednameplateStyle;
      hardButton.style = nameplateStyle;
    });
    
    hardButton.on('click', () => {
      this.difficulty = 1.25;
      easyButton.style = nameplateStyle;
      normalButton.style = nameplateStyle;
      hardButton.style = selectednameplateStyle;
    });
  
    // Text to choose the class
    const classLabel = new PIXI.Text('Choose your class:', nameplateStyle);
    classLabel.anchor.set(0.5);
    classLabel.position.set(400, 300);
  
    // Buttons to choose the class
    const warriorButton = this.createButton('Warrior', title.x - 100, title.y + 300);
    const mageButton = this.createButton('Mage', title.x, title.y + 300);
    const rogueButton = this.createButton('Rogue', title.x + 100, title.y + 300);
  
    // Event listeners for the class buttons
    warriorButton.on('click', () => {
      nombreClase = "Warrior";
      warriorButton.style = selectednameplateStyle;
      mageButton.style = nameplateStyle;
      rogueButton.style = nameplateStyle;
    });
    
    mageButton.on('click', () => {
      nombreClase = "Mage";
      warriorButton.style = nameplateStyle;
      mageButton.style = selectednameplateStyle;
      rogueButton.style = nameplateStyle;
    });
    
    rogueButton.on('click', () => {
      nombreClase = "Rogue";
      warriorButton.style = nameplateStyle
      mageButton.style = nameplateStyle;
      rogueButton.style = selectednameplateStyle;
    });
    startGameButton.on('click', async () => {
      // Verificar si se ha seleccionado la dificultad y la clase
      if (this.difficulty !== undefined && nombreClase) {
        this.player = new player(nombrePersonaje,nombreClase);
        console.log('Game is starting...');
        console.log('Selected Difficulty:', this.difficulty);
        console.log('Selected Class:', this.player.charClass);
        console.log('Name: ', this.player.charName);
        // Aquí puedes agregar la lógica para iniciar el juego
        await this.loadScreenOut();
        this.mainMenuOst.stop();
        this.battleOst.play();

        this.fight();
      } else {
        console.log('Please select difficulty and class before starting the game.');
      }
    });
    // Add elements to the stage
    this.app.stage.addChild(title, classLabel);
    this.app.stage.addChild(warriorButton, mageButton, rogueButton);
    this.app.stage.addChild(easyButton, normalButton, hardButton);
    this.app.stage.addChild(startGameButton);
    this.app.stage.addChild(difficultyLabel);
    this.app.stage.addChild(nameLabel);
    // Render and animate elements
    this.app.stage.render;
    await this.loadScreenEnter()
  }
  createButton(text:string, x:number, y:number) {
    const button = new PIXI.Text(text, nameplateStyle);
    button.anchor.set(0.5);
    button.position.set(x, y);
    button.interactive = true;
    return button;
  }
  
  /**
   * Fight scene
   */
  async fight() {
    /**
     * Background 
     */
    const backSprite= new backgroundClass(this.stageNum);
    const fightMenu=new fightMenuClass();
    const soundButton=PIXI.Sprite.from(PIXI.Texture.from(menuButtons.SOUND))
    let mute=false;
    soundButton.position.set(705,27)
    soundButton.scale.set(0.15)
    soundButton.eventMode='static';
    soundButton.addEventListener('click',()=>{
      if(!mute){
        this.battleOst.pause();
        soundButton.texture=PIXI.Texture.from(menuButtons.SOUNDOFF);
        mute=true;
      }else{
        this.battleOst.play();
        soundButton.texture=PIXI.Texture.from(menuButtons.SOUND);
        mute=false;
      }
    })
    const newEnemy = new enemy(this.difficulty,this.chartopia);

    await this.randomLevelName(this.levelName,this.stageNum);
    this.levelName.anchor.set(0.5);
    this.levelName.position.set(400,20);
    
    this.app.stage.addChild(backSprite.sprite,this.levelName)  //Background
    this.app.stage.addChild(newEnemy.sprite,newEnemy.namePlate,newEnemy.nextTurnSprite,newEnemy.currentStatusSprite,newEnemy.hittedIcon) //Enemy
    this.app.stage.addChild(this.player.currentTurnSprite,this.player.hittedIcon,this.player.currentStatusSprite,this.player.namePlate);
    this.app.stage.addChild(fightMenu.menuBack,fightMenu.attackButton,fightMenu.guardButton,fightMenu.runButton,fightMenu.itemButton) //Action Menu
    this.app.stage.addChild(playerTurnTitle,enemyTurnTitle);  //Turn Titlecards
    this.app.stage.addChild(this.playerHealthBar.barHealth);
    this.app.stage.addChild(this.playerHealthBar.playerHealth);
    this.app.stage.addChild(soundButton);
    await this.loadScreenEnter();
    
    let onFight = true;
    while(onFight === true){
      let playerPlayed;
      //Start Player Turn
      this.animationLogic.turnTextAnimation(playerTurnTitle,0.05);
      await this.animationLogic.timer(1000);

      //Player Turn Logic
      playerPlayed=await this.playerTurn(fightMenu,newEnemy);
      console.log(playerPlayed)
      this.menuUnavailable(fightMenu);
      await this.animationLogic.timer(2000);
      if(newEnemy.getHp <= 0){
        onFight = false;
      }else{
        //Enemy Turn
      if(playerPlayed==true){
          this.animationLogic.turnTextAnimation(enemyTurnTitle,0.05);
          await this.animationLogic.timer(1000);
      //Enemy Turn Logic
        await this.enemyPhaseLogic(newEnemy)
        await this.animationLogic.timer(2000);
        if(this.player.getHp <= 0){
          onFight = false;
        }
      }

      }

    }

    if(this.player.getHp <= 0){
      await this.animationLogic.deathAnimation(this.player.currentTurnSprite,0.05)
      await this.animationLogic.timer(1000);
      await this.loadScreenOut();
      this.endScreen(newEnemy);
    }else{
      if(newEnemy.getHp <= 0){
        if(this.stageNum==1){
          this.stageNum=2
        }
        this.score += newEnemy.score;
        this.levelNumber += 1;
        newEnemy.namePlate.alpha = 0;
        newEnemy.currentStatusSprite.alpha = 0;
        newEnemy.nextTurnSprite.alpha = 0;
        await this.animationLogic.deathAnimation(newEnemy.sprite,0.05)
        await this.animationLogic.timer(1000);
        //Load Next Level Menu
        this.app.stage.addChild(this.loadScreen);
        const nextLevel = PIXI.Sprite.from('/assets/game-assets/gui/continue-button.png')
        const txtNextLevel1 = new PIXI.Text('You won!', mainTitleStyle);
        const txtNextLevel2 = new PIXI.Text('You keep traveling', nameplateStyle);
        txtNextLevel1.anchor.set(0.5);
        txtNextLevel1.position.set(400, -200);
        txtNextLevel2.anchor.set(0.5);
        txtNextLevel2.position.set(400, -150);
        nextLevel.anchor.set(0.5)
        nextLevel.position.set(400,-100)
        nextLevel.width = 140;
        nextLevel.height = 51;
        
        this.app.stage.addChild(txtNextLevel1,txtNextLevel2,nextLevel);
        this.loadScreen.alpha = 0.75;
        await this.animationLogic.nextLevelAnimation(nextLevel,txtNextLevel1,txtNextLevel2,2.5)
        nextLevel.interactive = true;
        nextLevel.on('click',async() =>{
          const map= PIXI.Sprite.from('/assets/game-assets/gui/map.png');
          const map_node=PIXI.Sprite.from('/assets/game-assets/gui/map_node.png');
          map_node.eventMode='static';
          map.anchor.set(0.5);
          map.position.set(400,300);
          map_node.anchor.set(0.5);
          map_node.position.set(348,285);
          map_node.width=55;
          map_node.height=55;
          this.app.stage.addChild(map);
          this.app.stage.addChild(map_node);
          this.sounds.mapSound();
          map_node.addEventListener('click',async()=>{
            await this.loadScreenOut();
            this.fight();
          })
        
        })
      }
    }

    

    fightMenu.runButton.eventMode = 'static'
    fightMenu.runButton.addEventListener('click',async () => {
      await this.loadScreenOut();
      this.endScreen(newEnemy);
    })

  }

  async playerTurn(fightMenu:fightMenuClass, newEnemy:enemy):Promise<boolean>{
    
    return new Promise(resolve=>{
      let buttonDescrp:PIXI.Text=new PIXI.Text('');
      let actionText= new PIXI.Text("Choose an action...",fightMenuClass.menuDescrpStyle)
      //actionText.anchor.set(0.5);
      actionText.position.set(240,460)
      this.app.stage.addChild(actionText)
      fightMenu.attackButton.eventMode='static';
      fightMenu.attackButton.addEventListener('pointerover',()=>{
        this.app.stage.removeChild(actionText);   
        buttonDescrp= new PIXI.Text("Press to attack \n"+newEnemy.name+"!",fightMenuClass.menuDescrpStyle);
        
       fightMenuClass.setPositionMenuTXT(buttonDescrp);
       this.app.stage.addChild(buttonDescrp);
      })
      fightMenu.attackButton.addEventListener('mouseup',()=>{
        buttonDescrp.visible=false;
      })
      fightMenu.attackButton.addEventListener('pointerout',()=>{
        this.app.stage.removeChild(buttonDescrp);  
        this.app.stage.addChild(actionText)
  
      })

      fightMenu.attackButton.addEventListener('click',()=>{
          this.player.nextTurn=playerActions.ATTACK;
          this.player.action(newEnemy,this.playerHealthBar);
          this.animationLogic.hitIconAnimation(newEnemy.hittedIcon,0.03)
          this.sounds.attackEffect()
          this.animationLogic.characterAttack(this.player,5)
          this.app.stage.removeChild(buttonDescrp)
          resolve(true)
    })
    
    fightMenu.guardButton.eventMode='static';
    fightMenu.guardButton.addEventListener('pointerover',()=>{
      this.app.stage.removeChild(actionText);   
      buttonDescrp= new PIXI.Text("Defend yourself!",fightMenuClass.menuDescrpStyle);
      fightMenuClass.setPositionMenuTXT(buttonDescrp);

      this.app.stage.addChild(buttonDescrp);

    })
    fightMenu.guardButton.addEventListener('pointerout',()=>{
      this.app.stage.removeChild(buttonDescrp)   
      this.app.stage.addChild(actionText)
  
    })
    fightMenu.guardButton.addEventListener('click',()=>{
        this.player.nextTurn=playerActions.GUARD;
        this.player.action(newEnemy,this.playerHealthBar);
        this.sounds.shieldEffect()
        this.animationLogic.characterBuff(this.player,5)
        this.app.stage.removeChild(buttonDescrp)

        resolve(true)
    })
    fightMenu.guardButton.addEventListener('mouseup',()=>{
      this.app.stage.removeChild(buttonDescrp)
    })

    fightMenu.itemButton.eventMode='static';
    fightMenu.itemButton.addEventListener('pointerover',()=>{
      this.app.stage.removeChild(actionText);   
      buttonDescrp= new PIXI.Text("Use an item: get healed!",fightMenuClass.menuDescrpStyle);
      fightMenuClass.setPositionMenuTXT(buttonDescrp);

      this.app.stage.addChild(buttonDescrp);

    })
    fightMenu.itemButton.addEventListener('pointerout',()=>{
      this.app.stage.removeChild(buttonDescrp)  
      this.app.stage.addChild(actionText)
   
    })
    fightMenu.itemButton.addEventListener('click',()=>{
      
        this.player.nextTurn=playerActions.HEALTH_UP;
        this.player.action(newEnemy,this.playerHealthBar);
        this.sounds.healEffect()
        this.animationLogic.characterBuff(this.player,5)
        this.app.stage.removeChild(buttonDescrp)
        
        resolve(true)
    })
    fightMenu.itemButton.addEventListener('mouseup',()=>{
      this.app.stage.removeChild(buttonDescrp)
    })
    fightMenu.runButton.eventMode='static';
    fightMenu.runButton.addEventListener('pointerover',()=>{
      this.app.stage.removeChild(actionText); 
      this.app.stage.removeChild(buttonDescrp)  
      buttonDescrp= new PIXI.Text("Runaway!",fightMenuClass.menuDescrpStyle);
      fightMenuClass.setPositionMenuTXT(buttonDescrp);
      this.app.stage.addChild(buttonDescrp);

    })
    fightMenu.runButton.addEventListener('mouseout',async()=>{
      buttonDescrp.visible=false;  
      this.app.stage.addChild(actionText)
   
    })
    fightMenu.runButton.addEventListener('click',async ()=>{
      this.app.stage.removeChild(actionText)
      this.app.stage.removeChild(buttonDescrp)
      actionText.visible=false;
      await this.loadScreenOut();
      this.endScreen(newEnemy);
    })
    })
  }

  menuUnavailable(fightMenu:fightMenuClass){
    fightMenu.attackButton.eventMode='none';
    fightMenu.guardButton.eventMode='none';
    fightMenu.itemButton.eventMode='none';
    fightMenu.runButton.eventMode='none';
  }
  /**
   * End Game Screen
   */
  async endScreen(enemy: enemy){
    
    //Add background image

    //Adds main title
    let title = new PIXI.Text('YOUR LEGEND HAS ENDED',endTitleStyle);
    title.anchor.set(0.5);
    title.position.set(400,200)

    //Adds subtitle
    let subtitle = new PIXI.Text('Save your score',nameplateStyle)
    subtitle.anchor.set(0.5);
    subtitle.position.set(title.x,title.y + 100)

    //Renders scene and animations
    this.app.stage.addChild(title,subtitle)
    this.animationLogic.faddingText(title,0.005);
    this.animationLogic.faddingText(subtitle,0.003);
    
    //Transitions logic with loading screen
    subtitle.eventMode = 'static'
    subtitle.addEventListener('click', async() =>{
      await this.loadScreenOut()
      this.scoring.addSave(this.player,this.levelNumber,this.levelName.text,enemy,this.score);
      
    })

  }


  //GAME FUNCTIONS

  /**
   * Resets stage to add new items and events after transition
   */
  async stageReset(){
    this.app.stage.removeChildren();
    this.app.stage.removeAllListeners();
  }

  /**
   * Exit Screen Transition. Goes in the end screen function with an await.
   */
  async loadScreenOut(){
    this.app.stage.addChild(this.loadScreen)
      this.animationLogic.fadeToBlack(this.loadScreen,0.05)
      await this.animationLogic.timer(2000)
      this.stageReset()
  }

  /**
   * Loading screen loggin when launching a scene. Goes right after loaging the main sprites with an await
   */
  async loadScreenEnter(){
    this.app.stage.addChild(this.loadScreen)
    this.animationLogic.fadeFromBlack(this.loadScreen,0.05)
    await this.animationLogic.timer(1000)
    this.app.stage.removeChildAt(this.app.stage.children.length-1)
  }

  /**
   * The animation and logic for the enemy phase
   * @param enemy The enemy about to take it's turn
   */
  async enemyPhaseLogic(enemy: enemy){
    switch(enemy.nextTurn){
      case enemyActions.ATTACK:{
        this.animationLogic.enemyAttack(enemy,5)
        this.sounds.attackEffect()
        await this.animationLogic.hitIconAnimation(this.player.hittedIcon,0.03)
      }
        break
      case enemyActions.STRONG_ATTACK:{
        this.animationLogic.enemyAttack(enemy,5)
        this.sounds.attackEffect()
        await this.animationLogic.hitIconAnimation(this.player.hittedIcon,0.03)
      }
        break
      case enemyActions.DEFEND:{
        this.animationLogic.enemyBuff(enemy,5)
        this.sounds.shieldEffect()
      }
        break
      case enemyActions.STRONG_DEFEND:{
        this.animationLogic.enemyBuff(enemy,5)
        this.sounds.shieldEffect()
      }
        break
      case enemyActions.DEBUFF:{
        this.animationLogic.enemyAttack(enemy,5)
        this.player.currentStatusSprite.texture = PIXI.Texture.from(actionIcons.DEBUFF);
        this.player.currentStatusSprite.visible = true;
        this.sounds.debuffEffect()
      }
        break
      case enemyActions.STRONG_DEBUFF:{
        this.animationLogic.enemyAttack(enemy,5)
          this.player.currentStatusSprite.texture = PIXI.Texture.from(actionIcons.STRONG_DEBUFF);
          this.player.currentStatusSprite.visible = true;
          this.sounds.debuffEffect()
      }
        break
      case enemyActions.BUFF:{
        this.animationLogic.enemyBuff(enemy,5)
        this.sounds.buffEffect()
      }
        break
      case enemyActions.STRONG_BUFF:{
        this.animationLogic.enemyBuff(enemy,5)
        this.sounds.buffEffect()
      }
        break
    }
    
    enemy.enemyTurn(this.player,this.playerHealthBar)
  }

  async randomLevelName(nameplate: PIXI.Text,stage: number){
    if(stage === 1){
      getRandomName(chartNumber.TAVERN,this.chartopia,(error,result) => {
        if(error || result === undefined){
          nameplate.text = '';
          console.log(result);
        }else{
            nameplate.text = result;
            console.log(result);
        }
      })
    }else{
      getRandomName(chartNumber.DUNGEON,this.chartopia,(error,result) => {
        if(error || result === undefined){
          nameplate.text = '';
          console.log(result);
        }else{
            nameplate.text = result;
            console.log(result);
        }
      })
    }
    
    
  }
  
  

}
function resetDifficultyButtons() {
  throw new Error('Function not implemented.');
}

function resetClassButtons() {
  throw new Error('Function not implemented.');
}

