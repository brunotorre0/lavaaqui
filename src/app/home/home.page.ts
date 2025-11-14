import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { AccountMenuComponent } from './account-menu.component';

declare var google: any;

interface Laundry {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  isMapModalOpen = false;
  userEmail: string = '';
  selectedLaundry: Laundry | null = null;
  selectedLaundryMapUrl: SafeResourceUrl | null = null;
  tempSelectedLaundry: Laundry | null = null;
  private map: any = null;
  private markers: any[] = [];
  
  laundries: Laundry[] = [
    { id: '1', name: 'Lavandaria Central', address: 'Rua da República, 123, Lisboa', lat: 38.7223, lng: -9.1393 },
    { id: '2', name: 'Lavandaria Express', address: 'Avenida da Liberdade, 456, Porto', lat: 41.1579, lng: -8.6291 },
    { id: '3', name: 'Lavandaria Rápida', address: 'Rua do Comércio, 789, Braga', lat: 41.5518, lng: -8.4229 },
    { id: '4', name: 'Lavandaria Moderna', address: 'Praça do Comércio, 321, Coimbra', lat: 40.2033, lng: -8.4103 },
    { id: '5', name: 'Lavandaria 24h', address: 'Avenida Central, 654, Aveiro', lat: 40.6405, lng: -8.6538 }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.router.navigate(['/login']);
      return;
    }
    this.userEmail = email;
    
    const savedLaundry = localStorage.getItem('selectedLaundry');
    if (savedLaundry) {
      this.selectedLaundry = JSON.parse(savedLaundry);
      this.updateSelectedLaundryMap();
    }
  }

  goToHome() {
    if (this.router.url === '/home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/home']);
    }
  }

  openMap() {
    this.isMapModalOpen = true;
    this.tempSelectedLaundry = null;
  }

  onMapModalPresent() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  initMap() {
    if (typeof google === 'undefined' || !google.maps) {
      setTimeout(() => this.initMap(), 300);
      return;
    }

    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
      setTimeout(() => this.initMap(), 100);
      return;
    }

    if (this.map) {
      this.map = null;
    }

    this.map = new google.maps.Map(mapDiv, {
      center: { lat: 39.5, lng: -8.0 },
      zoom: 7
    });

    this.laundries.forEach(laundry => {
      const marker = new google.maps.Marker({
        position: { lat: laundry.lat, lng: laundry.lng },
        map: this.map,
        title: laundry.name
      });

      marker.addListener('click', () => {
        this.tempSelectedLaundry = laundry;
      });

      this.markers.push(marker);
    });
  }

  closeMap() {
    this.isMapModalOpen = false;
    this.tempSelectedLaundry = null;
    if (this.map) {
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];
      this.map = null;
    }
  }

  confirmSelection() {
    if (this.tempSelectedLaundry) {
      this.selectedLaundry = this.tempSelectedLaundry;
      localStorage.setItem('selectedLaundry', JSON.stringify(this.selectedLaundry));
      this.updateSelectedLaundryMap();
      this.closeMap();
    }
  }

  updateSelectedLaundryMap() {
    if (this.selectedLaundry) {
      const mapUrl = `https://maps.google.com/maps?q=${this.selectedLaundry.lat},${this.selectedLaundry.lng}&z=15&output=embed`;
      this.selectedLaundryMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    }
  }

  async openAccountMenu(event: Event) {
    const popover = await this.popoverController.create({
      component: AccountMenuComponent,
      event: event,
      translucent: true,
      componentProps: {
        userEmail: this.userEmail
      }
    });
    
    await popover.present();
    
    const { data } = await popover.onDidDismiss();
    if (data && data.logout) {
      this.logout();
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedLaundry');
    this.router.navigate(['/login']);
  }
}
