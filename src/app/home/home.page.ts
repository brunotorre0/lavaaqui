import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { AccountMenuComponent } from './account-menu.component';

declare var google: any;
declare var window: any;

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
    // Aguardar um pouco mais para garantir que o DOM está pronto
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  initMap() {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
      setTimeout(() => this.initMap(), 200);
      return;
    }

    // Limpar conteúdo anterior
    mapDiv.innerHTML = '';

    // Verificar se o Google Maps está carregado e tem chave válida
    if (typeof google === 'undefined' || !google.maps) {
      // Usar iframe do Google Maps como fallback (não requer chave de API)
      this.initMapWithIframe(mapDiv);
      return;
    }

    // Limpar mapa anterior se existir
    if (this.map) {
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];
      this.map = null;
    }

    try {
      this.map = new google.maps.Map(mapDiv, {
        center: { lat: 39.5, lng: -8.0 },
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        backgroundColor: '#e5e5e5'
      });

      // Adicionar marcadores
      this.laundries.forEach(laundry => {
        const marker = new google.maps.Marker({
          position: { lat: laundry.lat, lng: laundry.lng },
          map: this.map,
          title: laundry.name,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          },
          animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
          this.tempSelectedLaundry = laundry;
          this.map?.setCenter({ lat: laundry.lat, lng: laundry.lng });
          this.map?.setZoom(16);
        });

        this.markers.push(marker);
      });

      // Forçar resize do mapa após um pequeno delay
      setTimeout(() => {
        if (this.map) {
          google.maps.event.trigger(this.map, 'resize');
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      // Se houver erro, usar iframe como fallback
      this.initMapWithIframe(mapDiv);
    }
  }

  initMapWithIframe(mapDiv: HTMLElement) {
    // Usar iframe do Google Maps (funciona sem chave de API para visualização)
    const centerLat = 39.5;
    const centerLng = -8.0;
    
    // Criar URL do Google Maps com centro em Portugal
    const mapUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=7&output=embed`;
    
    const iframe = document.createElement('iframe');
    iframe.src = mapUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.title = 'Mapa de Lavandarias';
    
    mapDiv.appendChild(iframe);
    
    // Criar lista de lavandarias como overlay
    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.bottom = '20px';
    overlayContainer.style.left = '20px';
    overlayContainer.style.right = '20px';
    overlayContainer.style.zIndex = '1000';
    overlayContainer.style.maxHeight = '200px';
    overlayContainer.style.overflowY = 'auto';
    overlayContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    overlayContainer.style.borderRadius = '12px';
    overlayContainer.style.padding = '12px';
    overlayContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    overlayContainer.id = 'laundry-list-overlay';
    
    this.laundries.forEach((laundry) => {
      const item = document.createElement('div');
      item.style.padding = '12px';
      item.style.borderBottom = '1px solid #eee';
      item.style.cursor = 'pointer';
      item.style.transition = 'background-color 0.2s';
      
      const name = document.createElement('div');
      name.style.fontWeight = '600';
      name.style.color = '#111';
      name.style.marginBottom = '4px';
      name.textContent = laundry.name;
      
      const address = document.createElement('div');
      address.style.fontSize = '0.85rem';
      address.style.color = '#666';
      address.textContent = laundry.address;
      
      item.appendChild(name);
      item.appendChild(address);
      
      item.addEventListener('click', () => {
        this.tempSelectedLaundry = laundry;
        // Atualizar iframe para mostrar a lavandaria selecionada
        iframe.src = `https://www.google.com/maps?q=${laundry.lat},${laundry.lng}&z=16&output=embed`;
        // Esconder a lista e mostrar o card de seleção
        overlayContainer.style.display = 'none';
        // Forçar detecção de mudança do Angular
        setTimeout(() => {
          // O Angular vai detectar a mudança em tempSelectedLaundry e mostrar o card
        }, 100);
      });
      
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f5f5f5';
      });
      
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });
      
      overlayContainer.appendChild(item);
    });
    
    // Remover última borda
    const lastItem = overlayContainer.lastElementChild as HTMLElement;
    if (lastItem) {
      lastItem.style.borderBottom = 'none';
    }
    
    mapDiv.appendChild(overlayContainer);
  }

  searchLocation() {
    // Placeholder para funcionalidade de pesquisa
    console.log('Pesquisar localização');
  }

  centerMapOnUser() {
    if (navigator.geolocation && this.map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.map.setCenter(userLocation);
          this.map.setZoom(15);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }

  closeMap() {
    this.isMapModalOpen = false;
    this.tempSelectedLaundry = null;
    if (this.map) {
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];
      this.map = null;
    }
    // Mostrar novamente a lista de lavandarias se estiver escondida
    const overlay = document.getElementById('laundry-list-overlay');
    if (overlay) {
      overlay.style.display = 'block';
    }
  }

  confirmSelection() {
    if (this.tempSelectedLaundry) {
      this.selectedLaundry = this.tempSelectedLaundry;
      localStorage.setItem('selectedLaundry', JSON.stringify(this.selectedLaundry));
      this.updateSelectedLaundryMap();
      this.closeMap();
      // Garantir que volta ao home
      this.router.navigate(['/home']);
    }
  }

  cancelSelection() {
    this.tempSelectedLaundry = null;
    // Mostrar novamente a lista de lavandarias
    const overlay = document.getElementById('laundry-list-overlay');
    if (overlay) {
      overlay.style.display = 'block';
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

  goToDrying() {
    this.router.navigate(['/secagem/secar']);
  }

  goToHistory() {
    this.router.navigate(['/historico']);
  }
}
