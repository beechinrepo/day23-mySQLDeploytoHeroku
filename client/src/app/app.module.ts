import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { POComponent } from './components/po.component';
import { MainComponent } from './components/main.component';
import { UpdateComponent } from './components/update.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MyShopService } from './myshop.service';


@NgModule({
  declarations: [
    AppComponent,
    POComponent,
    MainComponent,
    UpdateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule, ReactiveFormsModule
  ],
  providers: [ MyShopService],
  bootstrap: [AppComponent]
})
export class AppModule { }
