import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PopoverController, ToastController } from '@ionic/angular';
import { AccountMenuComponent } from './account-menu.component';

declare var google: any;
declare var window: any;

interface Laundry {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priceMultiplier: number; // Multiplicador de preço para esta lavandaria
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
    { id: '1', name: 'Lavandaria Central', address: 'Rua da República, 123, Lisboa', lat: 38.7223, lng: -9.1393, priceMultiplier: 1.0 },
    { id: '2', name: 'Lavandaria Express', address: 'Avenida da Liberdade, 456, Porto', lat: 41.1579, lng: -8.6291, priceMultiplier: 1.2 },
    { id: '3', name: 'Lavandaria Rápida', address: 'Rua do Comércio, 789, Braga', lat: 41.5518, lng: -8.4229, priceMultiplier: 0.9 },
    { id: '4', name: 'Lavandaria Moderna', address: 'Praça do Comércio, 321, Coimbra', lat: 40.2033, lng: -8.4103, priceMultiplier: 1.1 },
    { id: '5', name: 'Lavandaria 24h', address: 'Avenida Central, 654, Aveiro', lat: 40.6405, lng: -8.6538, priceMultiplier: 1.15 }
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private popoverController: PopoverController,
    private toastController: ToastController
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

    // Obter localização atual do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.initMapWithLocation(mapDiv, userLocation);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          // Se não conseguir obter localização, usar localização padrão (centro de Portugal)
          const defaultLocation = { lat: 39.5, lng: -8.0 };
          this.initMapWithLocation(mapDiv, defaultLocation);
        }
      );
    } else {
      // Se geolocalização não estiver disponível, usar localização padrão
      const defaultLocation = { lat: 39.5, lng: -8.0 };
      this.initMapWithLocation(mapDiv, defaultLocation);
    }
  }

  initMapWithLocation(mapDiv: HTMLElement, centerLocation: { lat: number; lng: number }) {
    // Verificar se o Google Maps está carregado e tem chave válida
    if (typeof google === 'undefined' || !google.maps) {
      // Usar iframe do Google Maps como fallback (não requer chave de API)
      this.initMapWithIframe(mapDiv, centerLocation);
      return;
    }

    // Limpar mapa anterior se existir
    if (this.map) {
      this.markers.forEach(m => {
        m.setMap(null);
        // Remover círculos de ondas se existirem
        if ((m as any).waves) {
          (m as any).waves.forEach((wave: any) => wave.setMap(null));
        }
      });
      this.markers = [];
      this.map = null;
    }

    try {
      this.map = new google.maps.Map(mapDiv, {
        center: centerLocation,
        zoom: 10,
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

      // Adicionar marcador na localização atual do usuário
      const userMarker = new google.maps.Marker({
        position: centerLocation,
        map: this.map,
        title: 'A sua localização',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(40, 40)
        },
        animation: google.maps.Animation.DROP
      });
      this.markers.push(userMarker);

      // Adicionar marcadores das lavandarias com animação de ondas
      this.laundries.forEach(laundry => {
        // Criar círculo vermelho para o marcador
        const markerIcon = {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        };

        const marker = new google.maps.Marker({
          position: { lat: laundry.lat, lng: laundry.lng },
          map: this.map,
          title: laundry.name,
          icon: markerIcon,
          animation: google.maps.Animation.DROP
        });

        // Criar círculos animados (ondas) ao redor do marcador
        const createWave = (radius: number, delay: number) => {
          const circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            map: this.map,
            center: { lat: laundry.lat, lng: laundry.lng },
            radius: radius,
          });

          // Animação de expansão
          let currentRadius = radius;
          const expand = () => {
            currentRadius += 15;
            circle.setRadius(currentRadius);
            circle.set('fillOpacity', Math.max(0, 0.1 - (currentRadius - radius) / 200));
            circle.set('strokeOpacity', Math.max(0, 0.6 - (currentRadius - radius) / 200));
            
            if (currentRadius < radius + 150) {
              setTimeout(expand, 50);
            } else {
              // Reset e repetir
              currentRadius = radius;
              circle.setRadius(radius);
              circle.set('fillOpacity', 0.1);
              circle.set('strokeOpacity', 0.6);
              setTimeout(expand, delay);
            }
          };
          
          setTimeout(() => expand(), delay);
          return circle;
        };

        // Criar múltiplas ondas com delays diferentes
        const wave1 = createWave(30, 0);
        const wave2 = createWave(30, 500);
        const wave3 = createWave(30, 1000);

        marker.addListener('click', () => {
          this.tempSelectedLaundry = laundry;
          this.map?.setCenter({ lat: laundry.lat, lng: laundry.lng });
          this.map?.setZoom(16);
        });

        this.markers.push(marker);
        // Guardar os círculos para poder removê-los depois
        (marker as any).waves = [wave1, wave2, wave3];
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
      this.initMapWithIframe(mapDiv, centerLocation);
    }
  }

  initMapWithIframe(mapDiv: HTMLElement, centerLocation: { lat: number; lng: number }) {
    // Usar iframe do Google Maps (funciona sem chave de API para visualização)
    const centerLat = centerLocation.lat;
    const centerLng = centerLocation.lng;
    
    // Criar URL do Google Maps com centro na localização atual do usuário
    const mapUrl = `https://www.google.com/maps?q=${centerLat},${centerLng}&z=10&output=embed`;
    
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
    overlayContainer.style.bottom = '0px';
    overlayContainer.style.left = '0px';
    overlayContainer.style.right = '0px';
    overlayContainer.style.zIndex = '1000';
    overlayContainer.style.maxHeight = '220px';
    overlayContainer.style.overflowY = 'auto';
    overlayContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    overlayContainer.style.padding = '12px';
    overlayContainer.style.boxShadow = 'rgba(0, 0, 0, 0.15) 0px 4px 12px';
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.map) {
            this.map.setCenter(userLocation);
            this.map.setZoom(10);
          } else {
            // Se o mapa ainda não foi inicializado, reinicializar com a nova localização
            const mapDiv = document.getElementById('map');
            if (mapDiv) {
              mapDiv.innerHTML = '';
              this.initMapWithLocation(mapDiv, userLocation);
            }
          }
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

  removeSelectedLaundry() {
    this.selectedLaundry = null;
    localStorage.removeItem('selectedLaundry');
    this.selectedLaundryMapUrl = null;
  }

  removeSelectedLaundryAndClose() {
    this.removeSelectedLaundry();
    this.closeMap();
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
    } else if (data && data.updateProfile) {
      this.router.navigate(['/perfil']);
    }
  }

  logout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedLaundry');
    this.router.navigate(['/login']);
  }

  async goToWashing() {
    if (!this.selectedLaundry) {
      const toast = await this.toastController.create({
        message: 'Por favor, selecione uma lavandaria primeiro.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }
    this.router.navigate(['/lavagem/lavar']);
  }

  async goToDrying() {
    if (!this.selectedLaundry) {
      const toast = await this.toastController.create({
        message: 'Por favor, selecione uma lavandaria primeiro.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }
    this.router.navigate(['/secagem/secar']);
  }

  goToHistory() {
    this.router.navigate(['/historico']);
  }
}
