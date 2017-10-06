import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ServiceError } from '../model/service-error';
import { MaterialType } from '../model/material-type';

@Injectable()
export class MaterialTypeService {

  private readonly endpointUrl: string = '/api/material';
  private httpHeader: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private materialsSubject: BehaviorSubject<MaterialType[]> = new BehaviorSubject([]);
  private errorSubject: BehaviorSubject<ServiceError> = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient) {
    this.loadInitialData();
  }

  get materials(): Observable<MaterialType[]> {
    return this.materialsSubject.asObservable();
  }

  get errors(): Observable<ServiceError> {
    return this.errorSubject.asObservable();
  }

  createOrUpdateMaterial(material: MaterialType): void {
    this.httpClient.post(`${this.endpointUrl}`, material, { headers: this.httpHeader, observe: 'response' })
      .subscribe((response: HttpResponse<MaterialType>) => {
          switch (response.status) {
            case 200:  // Ok (Material Type has been updated successfully)
              this.onMaterialUpdated(material);
              break;
            case 201:  // Created (MaterialType has been created successfully)
              this.onMaterialCreated(response.body);
              break;
            default:
              this.publishError(response);
          }
        },
        (error: HttpErrorResponse) => this.publishError(error)
      );
  }

  deleteMaterial(material: MaterialType): void {
    this.httpClient.delete(`${this.endpointUrl}/${material.id}`, { headers: this.httpHeader, observe: 'response' })
      .subscribe((response: HttpResponse<null>) => {
          switch (response.status) {
            case 200:
              this.onMaterialDeleted(material);
              break;
            default:
              this.publishError(response);
          }
        },
        (error: HttpErrorResponse) => this.publishError(error)
      );
  }

  private loadInitialData(): void {
    this.httpClient.get<MaterialType[]>(`${this.endpointUrl}`, { observe: 'response' })
      .subscribe((response: HttpResponse<MaterialType[]>) => {
          if (response.status == 200) this.materialsSubject.next(response.body);
          else this.publishError(response);
        },
        (error: HttpErrorResponse) => this.publishError(error)
      );
  }

  private onMaterialUpdated(updatedMaterial: MaterialType) {
    this.materialsSubject.getValue().find((existentMaterial: MaterialType) => {
      // Updates the name of the corresponding Material Type in the current list, and publish it
      if (existentMaterial.id == updatedMaterial.id) {
        existentMaterial.name = updatedMaterial.name;
        this.materialsSubject.next(this.materialsSubject.getValue());
        return true;
      }
    });
  }

  private onMaterialCreated(newMaterial: MaterialType) {
    let materials: MaterialType[] = this.materialsSubject.getValue();
    this.materialsSubject.next(materials.concat(newMaterial));
  }

  private onMaterialDeleted(deletedMaterial: MaterialType): void {
    // Removes the deleted Material Type from the array
    let materials: MaterialType[] = this.materialsSubject.getValue()
      .filter((material: MaterialType) => material.id != deletedMaterial.id);

    this.materialsSubject.next(materials);
  }

  private publishError(response: HttpResponseBase) {
    this.errorSubject.next(ServiceError.fromStatusCode(response.status));
  }

}