import { AbstractControl, FormBuilder, FormGroup, Validators,ValidatorFn,ValidationErrors } from '@angular/forms';
import { Component } from '@angular/core';
import { UserbaseService } from 'src/app/services/userbase.service';
import { User } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent {
  
  constructor(private formBuilder: FormBuilder,private userbase: UserbaseService){

  }


  list: User[] = [];
  
  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => { //Validator para verificar contraseñas iguales
    let pass = group.get('password')!.value;
    let confirmPass = group.get('confirmPassword')!.value
    return pass === confirmPass ? null : { notSame: true }
  }
  
  newUser: FormGroup = this.formBuilder.group({
    username:['',[Validators.required,Validators.minLength(3)]],
    password:['',[Validators.required,Validators.minLength(3)]],
    confirmPassword:['',[Validators.required]],
    avatar:['option1']
  }, { validators: this.checkPasswords })
  
  async registraUsuario(){
    if(this.newUser.invalid){
      this.newUser.markAllAsTouched();
      return;
    } //Fallo por formulario invalido

    this.list = await this.userbase.getUsers();
    const foundUser: User|undefined = this.list.find((i) => i.usuario === this.newUser.controls['username'].value);

    if(foundUser){
      alert('El usuario elegido ya existe');
      this.newUser.reset();
      return;
    } //Fallo por usuario ya existente

    let avatarLink:string = '';
    
    switch(this.newUser.controls['avatar'].value){
      default:
        avatarLink = '/assets/avatars/warrior-avatar.png'
        break;
      case 'option2':
        avatarLink = '/assets/avatars/mage-avatar.png'
        break;
      case 'option3':
        avatarLink = 'assets/avatars/ranger-avatar.png'
        break;
    }

    const usuario: User = {
      usuario: this.newUser.controls['username'].value,
      constraseña: this.newUser.controls['password'].value,
      avatar: avatarLink,
      partidas: []
    }
    this.userbase.postUser(usuario);
    alert('Your account was created!')
  }

  validar(field: string, error: string){
    return this.newUser.controls[field].getError(error)
    &&
    this.newUser.controls[field].touched
  }
}
