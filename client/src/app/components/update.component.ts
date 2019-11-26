import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Order, OrderDetail } from '../model';
import { MyShopService } from '../myshop.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})

export class UpdateComponent implements OnInit {
  order: Order;
  orderDetails: FormArray;
  form: FormGroup = this.createForm({ email: '', orderDetails: [] }); // so wont be undefined when initialized
  orderId = 0;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private myShopSvc: MyShopService) { }

  ngOnInit() {
    const orderId = this.route.snapshot.params.orderId;
    console.log('orderId: ', orderId)
    this.myShopSvc.getOrder(orderId)
      .then(result => {
        console.log('result: ', result);
        this.order = result;
        this.form = this.createForm(result as Order);
        this.orderDetails = this.form.get('orderDetails') as FormArray;
      })
      .catch(error => {
        alert(error);
      });
  }

  addOrderDetails() {
    this.orderDetails.push(this.extraOrderDetails());
  }

  delete(idx: number) {
    this.orderDetails.removeAt(idx);
  }

  update() {
    // console.log('values: ', this.orderForm.value);
    const order: Order = {
      email: this.form.value['email'],
      orderDetails: []
    }
    for (let g = 0; g < this.orderDetails.length; g++) {
      const fg: FormGroup = this.orderDetails.controls[g] as FormGroup;
      order.orderDetails.push({
        description: fg.value['description'],
        quantity: parseInt(fg.value['quantity']) || 1
      } as OrderDetail);
    }
    this.myShopSvc.updateOrderDetails(this.route.snapshot.params.orderId, order)
      .then(() => {
        console.log('updated');
        this.orderDetails = this.fb.array([]);
        this.form.controls['orderDetails'] = this.orderDetails;
        this.form.reset();
      })
      .catch(err => console.error('error: ', err));
  }

  private extraOrderDetails(): FormGroup {
    return this.fb.group({
        description: this.fb.control('', [Validators.required]),
        quantity: this.fb.control('1', [Validators.required, Validators.min(1)]) // has to be a string
      })
  }

  private createOrderDetails(od: OrderDetail): FormGroup {
    return (
      this.fb.group({
        description: this.fb.control(od.description, [ Validators.required ]),
        quantity: this.fb.control(od.quantity, [ Validators.required, Validators.min(1) ])
      })
    );
  }

  private createForm(order: Order): FormGroup {
    const ordDetails = this.fb.array([]);
    for (let od of order.orderDetails)
      ordDetails.push(this.createOrderDetails(od as OrderDetail));
    const ordForm = this.fb.group({
      email: this.fb.control(order.email, [ Validators.required, Validators.email, Validators.minLength(5) ]),
      orderDetails: ordDetails
    })
    return (ordForm);
  }

}

// ord_details_id: response.ord_details_id, description: response.description, quantity: response.quantity
