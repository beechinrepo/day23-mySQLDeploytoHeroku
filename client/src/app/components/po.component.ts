import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Order, OrderDetail } from '../model';
import { MyShopService } from '../myshop.service';

@Component({
  selector: 'app-po',
  templateUrl: './po.component.html',
  styleUrls: ['./po.component.css']
})
export class POComponent implements OnInit {
  orderForm: FormGroup;
  orderDetails: FormArray;

  constructor(private fb: FormBuilder, private myShopSvc: MyShopService) {}

  ngOnInit() {
    this.orderDetails = this.fb.array([])
    this.orderForm = this.createForm(this.orderDetails);
  }
    // this.orderForm = this.createForm();
    // this.orderDetails = this.orderForm.get('orderDetails') as FormArray;

  checkout() {
    // console.log('values: ', this.orderForm.value);
    const order: Order = {
      email: this.orderForm.value['email'],
      orderDetails: []
    }
    for (let g =0; g<this.orderDetails.length; g++) {
      const fg: FormGroup = this.orderDetails.controls[g] as FormGroup;
      order.orderDetails.push({
        description: fg.value['description'],
        quantity: parseInt(fg.value['quantity']) || 1
      } as OrderDetail);
    }
    this.myShopSvc.createOrder(order)
      .then(() => {
        console.log('created');
        this.orderDetails = this.fb.array([]);
        this.orderForm.controls['orderDetails'] = this.orderDetails;
        this.orderForm.reset();
      })
      .catch(err => console.error('error: ', err));
  }

  addOrderDetails() {
    // console.log('Before: ', this.orderDetails.length())
    this.orderDetails.push(this.createOrderDetails());
    // console.log('After: ', this.orderDetails.length())
  }

  delete(idx: number) {
    this.orderDetails.removeAt(idx);
  }

  private createOrderDetails(): FormGroup {
    return this.fb.group({
        description: this.fb.control('', [Validators.required]),
        quantity: this.fb.control('1', [Validators.required, Validators.min(1)]) // has to be a string
      })
  }
  private createForm(od: FormArray= null): FormGroup {
    return this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email, Validators.minLength(5)]), // initial value
      orderDetails: od || this.fb.array([])  // either get or create array
    });
  }

}

// const fb = this.fb.group
// return (f)

// formArray is not really array. To get array: .control which is each a formgroup
