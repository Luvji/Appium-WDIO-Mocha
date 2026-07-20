import { BasePage } from "./base.page.js";

export class DragDropLabPage extends BasePage {
  get dragDropCardSelector() {
    return "~home_lab_5";
  }

  get dragDropCard() {
    return this.element(this.dragDropCardSelector);
  }

  get homeNavigationSelector() {
    return "~bottom_home";
  }

  get accessibleDragTabSelector() {
    return "~drag_drop_accessible_tab";
  }

  get accessibleDragTab() {
    return this.element(this.accessibleDragTabSelector);
  }

  async tapAccessibleTab() {
    await this.tap(this.accessibleDragTabSelector);
  }

  get accessibleDragBoardSelector() {
    return "~accessible_drag_board";
  }

  get accessibleDragBoard() {
    return this.element(this.accessibleDragBoardSelector);
  }

  get accessibleDragBoardResultSelector() {
    return "~Drag and drop result";
  }

  get accessibleDragBoardResult() {
    return this.element(this.accessibleDragBoardResultSelector);
  }

  get dragDropTitleSelector() {
    if (this.driver.isAndroid) {
      return 'android=new UiSelector().text("Drag & Drop Lab")';
    }

    return '-ios predicate string:label == "Drag & Drop Lab"';
  }

  get dragDropTitle() {
    return this.element(this.dragDropTitleSelector);
  }

  get accessibleDragSourceSelector() {
    return "~Draggable blue tile";
  }

  get accessibleDragSource() {
    return this.element(this.accessibleDragSourceSelector);
  }

  get accessibleDropTargetSelector() {
    return "~Green drop target";
  }

  get accessibleDropTarget() {
    return this.element(this.accessibleDropTargetSelector);
  }

  // get accessibleDragBoardResultSelector() {
  //   return "~Drag and drop result";
  // }

  // get accessibleDragBoardResult() {
  //   return this.element(this.accessibleDragBoardResultSelector);
  // }

  async dragSourceToTarget() {
    const source = await this.accessibleDragSource;
    const target = await this.accessibleDropTarget;

    await source.dragAndDrop(target, {
      duration: 1_500,
    });
  }

  async returnToDashboard() {
    await this.tap(this.homeNavigationSelector);
  }

  async waitUntilLoaded() {
    await this.waitUntilDisplayed(this.dragDropTitleSelector, 20_000);
  }

  async isLoaded() {
    return this.isDisplayed(this.dragDropTitleSelector);
  }
}
