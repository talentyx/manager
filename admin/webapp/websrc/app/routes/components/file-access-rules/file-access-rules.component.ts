import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { GlobalConstant } from '@common/constants/global.constant';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '@common/utils/app.utils';
import { MatDialog } from '@angular/material/dialog';
import { FileAccessRulesService } from '@services/file-access-rules.service';
import { AddEditFileAccessRuleModalComponent } from './partial/add-edit-file-access-rule-modal/add-edit-file-access-rule-modal.component';
import { PredefinedFileAccessRulesModalComponent } from './partial/predefined-file-access-rules-modal/predefined-file-access-rules-modal.component';
import { GlobalVariable } from '@common/variables/global.variable';
import { AuthUtilsService } from '@common/utils/auth.utils';

@Component({
  selector: 'app-file-access-rules',
  templateUrl: './file-access-rules.component.html',
  styleUrls: ['./file-access-rules.component.scss'],
})
export class FileAccessRulesComponent implements OnInit, OnChanges {
  @Input() isScoreImprovement: boolean = false;
  @Input() source!: string;
  @Input() groupName: string = '';
  @Input() resizableHeight!: number;
  private isModalOpen: boolean = false;
  private fileAccessRuleErr: boolean = false;
  public groups: Set<string> = new Set();
  public gridHeight: number = 0;
  public gridOptions!: GridOptions;
  public fileAccessRules: Array<any> = [];
  public selectedFileAccessRules;
  public navSource = GlobalConstant.NAV_SOURCE;
  private w: any;
  public globalConstant4Html = GlobalConstant;
  public groupSelection = new FormControl('All', [Validators.required]);
  public filteredCount: number = 0;
  public isWriteGroupAuthorized: boolean = false;

  constructor(
    private fileAccessRulesService: FileAccessRulesService,
    private authUtilsService: AuthUtilsService,
    private translate: TranslateService,
    private utils: UtilsService,
    private dialog: MatDialog
  ) {
    this.w = GlobalVariable.window;
  }

  ngOnInit(): void {
    console.log('on file access rules init: ', this.source);
    this.source = this.source ? this.source : GlobalConstant.NAV_SOURCE.SELF;
    this.isWriteGroupAuthorized =
      this.authUtilsService.getDisplayFlag('write_group') &&
      (this.source !== GlobalConstant.NAV_SOURCE.GROUP ? this.authUtilsService.getDisplayFlag('multi_cluster') : true);
    this.gridOptions = this.fileAccessRulesService.prepareGrid(
      this.isWriteGroupAuthorized,
      this.source,
      this.isScoreImprovement
    ).gridOptions4fileAccessRules;
    this.gridOptions.onSelectionChanged = () => {
      this.onSelectionChanged4File();
    };
    this.getFileAccessRules(this.groupName);
    this.groups.add('All');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (
      changes.groupName &&
      changes.groupName.previousValue &&
      changes.groupName.previousValue !== changes.groupName.currentValue
    ) {
      this.getFileAccessRules(this.groupName);
    }
  }

  getFileAccessRules = groupName => {
    this.selectedFileAccessRules = null;
    if (this.gridOptions) {
      this.gridOptions.overlayNoRowsTemplate = `<span class="overlay">${this.translate.instant(
        'general.NO_ROWS'
      )}</span>`;
    }
    if (groupName !== GlobalConstant.EXTERNAL) {
      this.fileAccessRulesService.getFileAccessRulesData(groupName).subscribe(
        response => {
          let fileAccessRulesData: Array<any> = [];
          if (groupName === '') {
            fileAccessRulesData = response['profiles'];
            let profiles = fileAccessRulesData.flatMap(profile => {
              if (profile.filters.length > 0) {
                this.groups.add(profile.group);
              }
              return profile.filters.map(filter => {
                return Object.assign(filter, { group: profile.group });
              });
            });
            this.fileAccessRules = profiles.filter(profile => {
              if (groupName === '') return true;
              return groupName === profile.group;
            });
          } else {
            this.fileAccessRules = response['profile']['filters'];
          }

          this.filteredCount = this.fileAccessRules.length;

          this.gridHeight =
            this.source === GlobalConstant.NAV_SOURCE.GROUP
              ? this.w.innerHeight - 572
              : this.source === GlobalConstant.NAV_SOURCE.FED_POLICY
              ? this.w.innerHeight - 250
              : 0;
          setTimeout(() => {
            if (this.gridOptions.api) {
              // this.gridOptions.api.setRowData($scope.profile);
              this.gridOptions.api.forEachNode((node, index) => {
                if (this.selectedFileAccessRules) {
                  if (
                    node.data.name === this.selectedFileAccessRules.name &&
                    node.data.path === this.selectedFileAccessRules.path
                  ) {
                    node.setSelected(true);
                    if (this.gridOptions.api)
                      this.gridOptions.api.ensureNodeVisible(node);
                  }
                } else if (index === 0) {
                  node.setSelected(true);
                  if (this.gridOptions.api)
                    this.gridOptions.api.ensureNodeVisible(node);
                }
              });
              this.gridOptions.api.sizeColumnsToFit();
            }
          });
        },
        err => {
          console.warn(err);
          if (err.status !== GlobalConstant.STATUS_NOT_FOUND) {
            this.gridOptions.overlayNoRowsTemplate =
              this.utils.getOverlayTemplateMsg(err);
          }
          this.fileAccessRules = [];
        }
      );
    }
  };

  showPredefinedRules = () => {
    this.isModalOpen = true;
    let predefinedRuleDialogRef = this.dialog.open(
      PredefinedFileAccessRulesModalComponent,
      {
        data: {
          groupName: this.groupName,
          source: this.source,
        },
        width: '70%',
        disableClose: true,
      }
    );
    predefinedRuleDialogRef.afterClosed().subscribe(result => {
      this.isModalOpen = false;
    });
  };

  removeProfile = data => {
    // sweetAlert({
    //   title: "Removal confirmation",
    //   text: `Will you remove file access rule? - Name: ${data.filter}`,
    //   icon: "warning",
    //   buttons: {
    //     cancel: {
    //       text: "Cancel",
    //       value: null,
    //       visible: true,
    //       className: "",
    //       closeModal: false
    //     },
    //     confirm: {
    //       text: "Remove",
    //       value: true,
    //       visible: true,
    //       className: "bg-danger",
    //       closeModal: false
    //     }
    //   }
    // }).then(isConfirm => {
    //   if (isConfirm) {
    this.fileAccessRulesService
      .updateFileAccessRuleList(
        GlobalConstant.CRUD.D,
        this.selectedFileAccessRules,
        this.groupName
      )
      .subscribe(
        response => {
          setTimeout(() => {
            this.getFileAccessRules(this.groupName);
          }, 1000);
          // sweetAlert(
          //   `Removed!`,
          //   `Your file access rule has been removed.`,
          //   "success"
          // );
        },
        err => {
          if (
            err.status !== GlobalConstant.STATUS_AUTH_TIMEOUT &&
            err.status !== GlobalConstant.STATUS_UNAUTH &&
            err.status !== GlobalConstant.STATUS_SERVER_UNAVAILABLE
          ) {
            let message = this.utils.getErrorMessage(err);
            // sweetAlert(
            //   "Error!",
            //   `Something wrong when remove file acess rule! - ${message}`,
            //   "error"
            // );
          }
        }
      );
    //   } else {
    //     sweetAlert("Cancelled", "Your file access rule is safe", "error");
    //   }
    // });
  };

  editProfile = data => {
    this.isModalOpen = true;
    let editDialogRef = this.dialog.open(AddEditFileAccessRuleModalComponent, {
      data: {
        type: 'edit',
        groupName: this.groupName,
        selectedRule: data,
        source: this.source,
        getFileAccessRules: this.getFileAccessRules,
      },
      disableClose: true,
    });
    editDialogRef.afterClosed().subscribe(result => {
      this.isModalOpen = false;
    });
  };

  addProfile = () => {
    this.isModalOpen = true;
    let addDialogRef = this.dialog.open(AddEditFileAccessRuleModalComponent, {
      data: {
        type: 'add',
        groupName: this.groupName,
        source: this.source,
        getFileAccessRules: this.getFileAccessRules,
      },
      disableClose: true,
    });
    addDialogRef.afterClosed().subscribe(result => {
      this.isModalOpen = false;
    });
  };

  onGroupChanged = (groupName: string, gridOptions: GridOptions) => {
    if (gridOptions && gridOptions.api) {
      const filterInstance = gridOptions.api.getFilterInstance('group');
      if (filterInstance) {
        const model = filterInstance.getModel();
        filterInstance.setModel({
          type: 'equals',
          filter: groupName === 'All' ? '' : groupName,
        });
        gridOptions.api.onFilterChanged();
        this.filteredCount =
          gridOptions.api.getModel()['rootNode'].childrenAfterFilter.length;
      }
    }
  };

  private onSelectionChanged4File = () => {
    if (this.gridOptions && this.gridOptions.api) {
      let selectedRows = this.gridOptions.api.getSelectedRows();
      if (selectedRows.length > 0) {
        setTimeout(() => {
          this.selectedFileAccessRules = selectedRows[0];
        });
      }
    }
  };
}