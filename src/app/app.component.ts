import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public pageDetails = false;

  onSwitchScreen(value: boolean) {
    this.pageDetails = value;
  }

  preventDefaultContextMenu(event: MouseEvent) {
    event.preventDefault()
  }
}

