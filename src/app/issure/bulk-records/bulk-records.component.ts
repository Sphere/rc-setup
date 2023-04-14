import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general/general.service';
import { DataService } from 'src/app/services/data/data-request.service'
import { CsvService } from 'src/app/services/csv/csv.service';

import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-bulk-records',
  templateUrl: './bulk-records.component.html',
  styleUrls: ['./bulk-records.component.scss']
})
export class BulkRecordsComponent implements OnInit {
  headerName: string = 'plain';
  pdfName: any;
  id: string;
  schemaObj;
  tempObj: any;
  nameArray = [];
  nameArray2;
  fileName = '';
  domain: any;
  apiUrl: string;
  schemaName: string;
  filedata: any;
  csvReport: boolean;
  uploadFileList: any;
  isgetCsvReport: boolean;
  item: any;
  colomNames: any;
  constructor(public router: Router, public route: ActivatedRoute, public dataService :DataService,
    public generalService: GeneralService, private http: HttpClient, 
    public csvService: CsvService,
    private config: AppConfig) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.schemaName = this.route.snapshot.paramMap.get('document');
  }

  ngOnInit(): void {

    this.generalService.getData('/Schema/' + this.id).subscribe((res) => {
      this.schemaObj = JSON.parse(res.schema);
      this.tempObj = this.schemaObj.definitions[this.schemaObj.title].properties;
      Object.values(this.tempObj).forEach(entry => {
        this.nameArray.push(entry['title']);

      });

      this.nameArray2 = this.nameArray.join();
    
    }, err => {

      console.log(err);
    });

    

    this.domain = this.config.getEnv('domainName');
 
      let header = {
        Accept: '*/*'
      }
       this.generalService.getData(this.domain + '/bulk/v1/bulk/sample/' + this.schemaName, true, header).subscribe((res) => {
        this.colomNames = res;
      }, err => {
        console.log(err);
      
        if(err.status == 200)
        {
          this.colomNames =  err.error.text;
        }
      });
    
  }



  downloadCSV() {
   this.csvService.downloadCSVTemplate(this.colomNames);
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];
    this.filedata = File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      const formData = new FormData();
  
    }
  }

  uploadFile()
  {
    this.fileName = this.filedata.name;

    const formData = new FormData();
    this.domain = this.config.getEnv('domainName');
  
    if(this.filedata.type === "text/csv"){

      formData.append("file", this.filedata);

      this.apiUrl = this.domain + "/bulk/v1/uploadFiles/" + this.schemaName;
      
      this.generalService.postData(this.apiUrl, formData).subscribe((res) => {
        this.item = res;
        this.csvReport = true;
        this.getAllUploadedFile();
  
      }, err => {
        this.csvReport = true;
        console.log(err);
      });
    }else{
       this.showReportFailPopup();
    }
   

  }

  getAllUploadedFile()
  {
    this.domain = this.config.getEnv('domainName');
    this.generalService.getData(this.domain + '/bulk/v1/bulk/uploadedFiles', true).subscribe((res) => {
      this.uploadFileList = res[res.length - 1];
      this.showReportPopup();
     
    }, err => {
      this.isgetCsvReport = true;
      console.log(err);
      this.showReportFailPopup();
    });
  }

  downloadErrFile()
  {

    this.domain = this.config.getEnv('domainName');
    let header = {
      Accept: '*/*'
    }

    this.generalService.getData(this.domain + '/bulk/v1/download/' + this.uploadFileList.ID, true, header).subscribe((res) => {
  let bulkReport: any = '`' + res + '`'; 
     
  this.csvService.downloadCSVTemplate(bulkReport);
  
    }, err => {
      if(err.status == 200)
      {
        let bulkReport: any = '`' + err.error.text + '`'; 
        this.csvService.downloadCSVTemplate(bulkReport);
      }
      console.log(err);
    });
  
  }

  showReportPopup(id = 'bulkUploadModalSuccess') {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  showReportFailPopup(id = 'bulkUploadModalfail') {
    var button = document.createElement("button");
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', `#${id}`);
    document.body.appendChild(button)
    button.click();
    button.remove();
  }

  backTo()
  {
    this.router.navigateByUrl('records/' + this.schemaName + '/' + this.id)
  }
}
