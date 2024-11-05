import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';
import { use } from 'echarts';
import { ConfigDataService } from '../config-data.service';
import { LoginComponent } from '../login/login.component';
import { ToastrService } from 'ngx-toastr';
import { error } from 'console';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit{
  name:String='';
  selectedRole: string = '';
  selectedDesignation: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  roleentered:String = '';
  designationEntered:String = '';
  Roles: { id: number; role: string; created_at: string }[] = []; // Example roles
  Designation: {id:number; designation:string; created_at:string}[]=[]; // Example positions
  state:string = "Add";
  users = [];
  id!:string;
  baseUrl:String = 'http://192.168.0.100:3000/api/users/';
  constructor(private http: HttpClient, private config:ConfigDataService, private toast:ToastrService) {}
  ngOnInit(): void {
    this.getUsers();
    this.getRoles();
    this.getDesignation();
  }
  

  editUser(){
    const editUser = {
      id:this.id,
      name: this.name,
      username: this.username,
      role: this.selectedRole,
      designation: this.selectedDesignation,
      email: this.email,
      password: this.password,
  };
  this.http.post('http://192.168.0.100:3000/api/users/edit', editUser).subscribe({
    next:(response:any)=>{
      console.log('user edit successfully', response);

this.getUsers();
            this.resetForm();
            this.state = "Add";
    },
    error:(err)=>{
      console.log("error:", err);
    }
  })
  }
naaavigate(){
  if(this.state == "Add"){
    this.registerUser();
  }else if(this.state == "Edit"){
    this.editUser();
  }

}



preEdit(users:any){
  this.state = "Edit";
  console.log(this.state, users['id']);
  this.name = users['name'];
  this.username = users['username'];
  this.password = users['password'];
  this.selectedRole = users['role'];
  this.selectedDesignation = users['designation'];
  this.email = users['email'];
  this.id = users['id'];
  
 
}
  registerUser() {
    const newUser = {
      id: this.id,
        name: this.name,
        username: this.username,
        role: this.selectedRole,
        designation: this.selectedDesignation,
        email: this.email,
        password: this.password,
    };

    // Send the new user data to your backend API
    this.http.post('http://192.168.0.100:3000/api/users/register', newUser).subscribe({
        next: (response: any) => {
            console.log('User registered successfully', response);
            // Optional: You can show a success message to the user
            // alert(response.message); // Show success message

            // Optionally, you can update the users array to reflect the new user
            // this.users.push(newUser); // Update the users list
            this.getUsers();
            this.resetForm(); // Reset the form fields after successful registration
        },
        error: (error) => {
            console.error('Error registering user', error);
            this.toast.error('Error registering user. Please try again.'); // Show error message
        },
    });
}

getUsers(){
  this.http.get('http://192.168.0.100:3000/api/users').subscribe((response:any)=>{
    console.log(response);
    this.users=response;
  },
(error)=>{
  console.log("Error getting users list", error);
}
);
}
getRoles(){
  this.http.get('http://192.168.0.100:3000/api/users/getroles').subscribe((response:any)=>{
    console.log("roles",response);
    this.Roles=response;
  },
  (error)=>{
    console.log("Error getting users roles", error);
  }
);
}
addRole(){
  const newrole= {
    role: this.roleentered
  }
this.http.post('http://192.168.0.100:3000/api/users/addrole',newrole).subscribe({
  next: (response: any) => {
    console.log('Role added successfully', response);
    this.getRoles();
    this.addLog(`Added new role (${this.roleentered}) `);
  },error: (error) => {
    console.error('Error adding new role', error);
    alert('Error adding new role. Please try again.'); // Show error message
},
});

}

addLog(logData:string){
  const newlog= {
    log: logData
  }

  this.config.AddLog(newlog).subscribe(response=>{
    console.log(response);
  },
(error)=>{
  console.log("Error adding log", error);
}
);

  
}

addDesignation(){
  const newdesignation= {
    designation: this.selectedDesignation
  }
this.http.post('http://192.168.0.100:3000/api/users/adddesignation',newdesignation).subscribe({
  next: (response: any) => {
    console.log('Designation added successfully', response);
    this.getDesignation();

  },error: (error) => {
    console.error('Error adding new Designation', error);
    alert('Error adding new Designation. Please try again.'); // Show error message
},
});
};
getDesignation(){
  this.http.get('http://192.168.0.100:3000/api/users/getdesignation').subscribe((response:any)=>{
    console.log('designation',response);
    this.Designation=response;
  },
  (error)=>{
    console.log("Error getting designation list", error);
  }
)
};

DeleteRole(id:number){
  this.http.delete(`http://192.168.0.100:3000/api/users/deleteRole/${id}`).subscribe({
    next: (response) => {
      console.log('Role deleted successfully', response);
      this.getRoles();
      // You can add logic here to update your UI or users list
    },
    error: (error) => {
      console.error('Error deleting role', error);
    },
  });
};
//delete desig
DeleteDesignation(id:number){
  this.http.delete(`http://192.168.0.100:3000/api/users/deleteDesignation/${id}`).subscribe({
    next: (response) => {
      console.log('Designation deleted successfully', response);
      this.getDesignation();
      // You can add logic here to update your UI or users list
    },
    error: (error) => {
      console.error('Error deleting Designation', error);
    },
  });
}
resetForm() {
    this.name = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.selectedRole = '';
    this.selectedDesignation = '';
}

}
