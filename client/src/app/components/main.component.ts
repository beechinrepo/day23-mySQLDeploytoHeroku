import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      orderId: this.fb.control('', [ Validators.required ])
    })
  }

  search() {
    const orderId = this.form.value['orderId'];
    console.log('orderId: ', orderId);
    this.router.navigate([`order/${orderId}`]);
    this.form.reset();
  }
}
