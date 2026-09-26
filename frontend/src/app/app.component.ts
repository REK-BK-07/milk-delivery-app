import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from './customer.service';
import { Customer, MonthlyBill } from './models';

type Tab = 'customers' | 'daily' | 'billing';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Milkday home" (click)="$event.preventDefault()">
          <span class="brand-mark" aria-hidden="true">✳</span>
          <span>milkday<span class="brand-dot">.</span></span>
        </a>
        <span class="topbar-note"><span class="status-dot"></span> Delivery desk</span>
      </header>

      <main class="content">
        <section class="intro">
          <div>
            <p class="eyebrow">DAILY OPERATIONS</p>
            <h1>Milk, made simple.</h1>
            <p class="subtitle">Manage your customers, record deliveries, and keep billing clear.</p>
          </div>
          <div class="date-chip"><span aria-hidden="true">◷</span> {{ today | date:'EEEE, d MMMM' }}</div>
        </section>

        <section class="stats" aria-label="Overview">
          <article class="stat-card"><div class="stat-icon green">♙</div><div><span class="stat-label">CUSTOMERS</span><strong>{{ customers.length }}</strong></div></article>
          <article class="stat-card"><div class="stat-icon yellow">◉</div><div><span class="stat-label">SERVICE</span><strong class="service-value"><span class="status-dot"></span> Active</strong></div></article>
          <article class="stat-card stat-tip"><div class="stat-icon cream">✦</div><div><span class="stat-label">A LITTLE TIP</span><strong class="tip-text">Fresh entries make accurate bills.</strong></div></article>
        </section>

        <nav class="tabs" aria-label="Main sections" role="tablist">
          <button type="button" role="tab" [attr.aria-selected]="activeTab === 'customers'" [class.active]="activeTab === 'customers'" (click)="setTab('customers')"><span>♙</span> Customers</button>
          <button type="button" role="tab" [attr.aria-selected]="activeTab === 'daily'" [class.active]="activeTab === 'daily'" (click)="setTab('daily')"><span>◷</span> Daily entry</button>
          <button type="button" role="tab" [attr.aria-selected]="activeTab === 'billing'" [class.active]="activeTab === 'billing'" (click)="setTab('billing')"><span>▤</span> Monthly billing</button>
        </nav>

        <div *ngIf="notice" class="notice" [class.error]="noticeType === 'error'" role="status">
          <span>{{ noticeType === 'error' ? '!' : '✓' }}</span>{{ notice }}
          <button type="button" aria-label="Dismiss notification" (click)="notice = ''">×</button>
        </div>

        <section *ngIf="activeTab === 'customers'" class="workspace-grid">
          <article class="panel form-panel">
            <div class="panel-heading"><div><p class="eyebrow">GET STARTED</p><h2>Add a customer</h2></div><span class="heading-icon">＋</span></div>
            <p class="panel-copy">Add a household to your daily delivery route.</p>
            <form [formGroup]="customerForm" (ngSubmit)="addCustomer()" novalidate>
              <label for="customer-name">Full name</label>
              <input id="customer-name" formControlName="name" placeholder="e.g. Asha Patel" autocomplete="name">
              <small class="field-error" *ngIf="invalid(customerForm, 'name')">Enter a name (up to 120 characters).</small>
              <label for="customer-phone">Phone number</label>
              <input id="customer-phone" formControlName="phone" placeholder="e.g. +91 98765 43210" autocomplete="tel">
              <small class="field-error" *ngIf="invalid(customerForm, 'phone')">Enter a valid phone number.</small>
              <label for="customer-address">Delivery address</label>
              <textarea id="customer-address" formControlName="address" placeholder="House number, street, area" rows="2" autocomplete="street-address"></textarea>
              <small class="field-error" *ngIf="invalid(customerForm, 'address')">Address is required.</small>
              <label for="customer-rate">Milk rate <span class="label-hint">per liter · ₹</span></label>
              <div class="input-with-prefix"><span>₹</span><input id="customer-rate" type="number" min="0.01" step="0.01" formControlName="milkRatePerLiter" placeholder="60.00"></div>
              <small class="field-error" *ngIf="invalid(customerForm, 'milkRatePerLiter')">Enter a rate greater than zero.</small>
              <button class="primary-button full-button" type="submit" [disabled]="savingCustomer">
                {{ savingCustomer ? 'Saving…' : 'Add customer' }} <span aria-hidden="true">→</span>
              </button>
            </form>
          </article>

          <article class="panel list-panel">
            <div class="list-heading"><div><p class="eyebrow">YOUR ROUTE</p><h2>Customers <span class="count">{{ customers.length }}</span></h2></div><button class="icon-button" type="button" aria-label="Refresh customer list" (click)="loadCustomers()">↻</button></div>
            <div *ngIf="loadingCustomers" class="empty-state"><span class="loader"></span><p>Loading customers…</p></div>
            <div *ngIf="!loadingCustomers && customers.length === 0" class="empty-state"><span class="empty-icon">♙</span><strong>Your customer list is empty</strong><p>Add your first customer using the form.</p></div>
            <div *ngIf="!loadingCustomers && customers.length > 0" class="table-wrap">
              <table><thead><tr><th>CUSTOMER</th><th>PHONE</th><th>RATE / L</th></tr></thead>
                <tbody><tr *ngFor="let customer of customers; trackBy: trackCustomer">
                  <td><div class="person"><span class="avatar">{{ initials(customer.name) }}</span><span><strong>{{ customer.name }}</strong><small>{{ customer.address }}</small></span></div></td>
                  <td class="muted-cell">{{ customer.phone }}</td><td class="rate-cell">₹{{ customer.milkRatePerLiter | number:'1.2-2' }}</td>
                </tr></tbody>
              </table>
            </div>
            <p class="list-footnote" *ngIf="customers.length > 0">Customer rates are used to calculate monthly bills.</p>
          </article>
        </section>

        <section *ngIf="activeTab === 'daily'" class="single-panel-wrap">
          <article class="panel narrow-panel">
            <div class="panel-heading"><div><p class="eyebrow">DELIVERY LOG</p><h2>Record today's milk</h2></div><span class="heading-icon yellow-icon">◷</span></div>
            <p class="panel-copy">Save the quantity delivered to a customer on a particular day.</p>
            <div class="inline-note" *ngIf="customers.length === 0">Add a customer first to log a delivery.</div>
            <form [formGroup]="entryForm" (ngSubmit)="addEntry()" novalidate>
              <label for="entry-customer">Customer</label>
              <select id="entry-customer" formControlName="customerId"><option value="">Choose a customer</option><option *ngFor="let customer of customers" [value]="customer.id">{{ customer.name }} · {{ customer.phone }}</option></select>
              <small class="field-error" *ngIf="invalid(entryForm, 'customerId')">Choose a customer.</small>
              <div class="two-fields"><div><label for="entry-date">Delivery date</label><input id="entry-date" type="date" formControlName="date"><small class="field-error" *ngIf="invalid(entryForm, 'date')">Choose a date.</small></div>
              <div><label for="entry-liters">Quantity delivered</label><div class="input-with-suffix"><input id="entry-liters" type="number" min="0.01" step="0.1" formControlName="liters" placeholder="2.0"><span>L</span></div><small class="field-error" *ngIf="invalid(entryForm, 'liters')">Enter liters greater than zero.</small></div></div>
              <button class="primary-button full-button" type="submit" [disabled]="savingEntry || customers.length === 0">{{ savingEntry ? 'Saving…' : 'Save delivery' }} <span aria-hidden="true">→</span></button>
            </form>
          </article>
        </section>

        <section *ngIf="activeTab === 'billing'" class="billing-layout">
          <article class="panel bill-filter">
            <div class="panel-heading"><div><p class="eyebrow">INVOICE LOOKUP</p><h2>Find a monthly bill</h2></div><span class="heading-icon cream-icon">▤</span></div>
            <p class="panel-copy">Choose a customer and billing period to see the delivery summary.</p>
            <div class="inline-note" *ngIf="customers.length === 0">Add a customer before looking up a bill.</div>
            <form [formGroup]="billingForm" (ngSubmit)="fetchBill()" novalidate>
              <label for="bill-customer">Customer</label>
              <select id="bill-customer" formControlName="customerId"><option value="">Choose a customer</option><option *ngFor="let customer of customers" [value]="customer.id">{{ customer.name }}</option></select>
              <div class="two-fields"><div><label for="bill-year">Year</label><input id="bill-year" type="number" min="1" max="9999" formControlName="year"></div>
              <div><label for="bill-month">Month</label><select id="bill-month" formControlName="month"><option *ngFor="let month of months; let i = index" [value]="i + 1">{{ month }}</option></select></div></div>
              <small class="field-error" *ngIf="invalid(billingForm, 'customerId')">Choose a customer.</small>
              <button class="primary-button full-button" type="submit" [disabled]="loadingBill || customers.length === 0">{{ loadingBill ? 'Calculating…' : 'Show bill' }} <span aria-hidden="true">→</span></button>
            </form>
          </article>
          <article class="bill-card" [class.bill-empty]="!bill">
            <ng-container *ngIf="bill; else billPlaceholder">
              <div class="bill-top"><span class="bill-icon">✦</span><span class="bill-period">{{ months[bill.month - 1] }} {{ bill.year }}</span></div>
              <p class="eyebrow">MONTHLY STATEMENT</p><h2>{{ customerName(bill.customerId) }}</h2>
              <p class="bill-subtitle">A clear summary of this month's deliveries.</p>
              <div class="bill-divider"></div>
              <div class="bill-line"><span>Total milk delivered</span><strong>{{ bill.totalLiters | number:'1.0-2' }} <small>L</small></strong></div>
              <div class="bill-line"><span>Rate per liter</span><strong>₹{{ bill.ratePerLiter | number:'1.2-2' }}</strong></div>
              <div class="bill-total"><span>Total amount due</span><strong>₹{{ bill.totalBillAmount | number:'1.2-2' }}</strong></div>
              <p class="bill-caption">Calculated from recorded deliveries for this month.</p>
            </ng-container>
            <ng-template #billPlaceholder><div class="bill-placeholder"><span class="placeholder-icon">▤</span><h2>Your bill, at a glance.</h2><p>Select a customer and month to see their delivery total and amount due.</p><div class="placeholder-rule"></div><span class="secure-label">✦ &nbsp; SIMPLE · CLEAR · UP TO DATE</span></div></ng-template>
          </article>
        </section>

        <footer><span>Made for the everyday milk run.</span><span>Milkday <span class="brand-dot">✳</span></span></footer>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .app-shell { min-height:100vh; background:#f6f8f3; color:#25352e; }
    .topbar { height:68px; padding:0 max(24px, calc((100% - 1120px)/2)); display:flex; align-items:center; justify-content:space-between; background:#fff; border-bottom:1px solid #e8ece5; }
    .brand { display:flex; align-items:center; gap:9px; color:#264735; text-decoration:none; font-size:20px; font-weight:800; letter-spacing:-.8px; }
    .brand-mark { display:grid; place-items:center; width:31px; height:31px; border-radius:10px; color:#fff; background:#377553; font-size:19px; }
    .brand-dot { color:#e5a63a; }.topbar-note { color:#748078; font-size:12px; display:flex; align-items:center; gap:8px; }
    .status-dot { width:7px; height:7px; border-radius:50%; background:#68a87d; display:inline-block; box-shadow:0 0 0 3px #e8f4eb; }
    .content { max-width:1120px; margin:auto; padding:43px 24px 22px; }
    .intro { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:26px; }.eyebrow { margin:0 0 9px; color:#809087; font-size:10px; font-weight:800; letter-spacing:1.5px; }
    h1,h2,p { margin-top:0; } h1 { margin-bottom:7px; color:#233d2f; font-size:clamp(29px,4vw,39px); letter-spacing:-1.5px; line-height:1.1; }.subtitle { margin-bottom:0; color:#7c8880; font-size:14px; }
    .date-chip { background:white; border:1px solid #e8ece5; border-radius:20px; padding:9px 14px; color:#65756a; font-size:12px; white-space:nowrap; }.date-chip span { margin-right:6px; color:#478261; }
    .stats { display:grid; grid-template-columns:1fr 1fr 1.35fr; gap:14px; margin-bottom:25px; }.stat-card { min-height:82px; display:flex; align-items:center; gap:13px; padding:16px 19px; border:1px solid #e8ece5; border-radius:12px; background:#fff; }.stat-icon { display:grid; place-items:center; flex:none; width:38px; height:38px; border-radius:11px; font-size:17px; }.green { background:#eaf3ec; color:#3e8054; }.yellow { background:#fbf2dc; color:#bb8c26; }.cream { background:#f7eee5; color:#ae7956; }.stat-label { display:block; margin-bottom:5px; color:#87928a; font-size:9px; font-weight:800; letter-spacing:1.1px; }.stat-card strong { display:block; color:#2c4436; font-size:18px; }.stat-card .service-value { display:flex; gap:9px; align-items:center; font-size:14px; }.tip-text { font-size:13px!important; font-weight:600; }
    .tabs { display:flex; gap:6px; width:max-content; max-width:100%; padding:5px; border:1px solid #e8ece5; border-radius:10px; background:#fff; margin-bottom:17px; overflow:auto; }.tabs button { border:0; border-radius:7px; background:transparent; padding:10px 16px; color:#7b8880; font:inherit; font-size:12px; font-weight:600; white-space:nowrap; cursor:pointer; }.tabs button span { padding-right:6px; }.tabs button.active { background:#eaf2eb; color:#34724c; }
    .workspace-grid { display:grid; grid-template-columns:minmax(275px,.86fr) minmax(0,1.6fr); gap:17px; align-items:start; }.panel { background:#fff; border:1px solid #e7ece5; border-radius:13px; box-shadow:0 3px 15px #29412e08; }.form-panel { padding:24px; }.panel-heading,.list-heading { display:flex; justify-content:space-between; align-items:center; }.panel-heading h2,.list-heading h2 { margin:0; color:#2b4033; font-size:20px; letter-spacing:-.5px; }.panel-heading .eyebrow,.list-heading .eyebrow { margin-bottom:6px; }.heading-icon { display:grid; place-items:center; width:35px; height:35px; border-radius:10px; background:#eaf3ec; color:#47805a; font-size:20px; }.yellow-icon { background:#fbf2dc; color:#b98b2c; }.cream-icon { background:#f6eee5; color:#a77d5e; }.panel-copy { margin:8px 0 20px; color:#89948c; font-size:12px; line-height:1.55; }
    form label { display:block; margin:14px 0 6px; color:#536258; font-size:11px; font-weight:700; } .label-hint { color:#99a29b; font-weight:500; }.panel input,.panel textarea,.panel select { width:100%; box-sizing:border-box; border:1px solid #e2e8e1; border-radius:7px; background:#fff; padding:10px 11px; color:#33443a; font:inherit; font-size:12px; outline:none; transition:border-color .15s, box-shadow .15s; }.panel input:focus,.panel textarea:focus,.panel select:focus { border-color:#76a583; box-shadow:0 0 0 3px #eaf3ec; }.panel input::placeholder,.panel textarea::placeholder { color:#b0b9b2; }.panel textarea { resize:vertical; min-height:57px; }.input-with-prefix,.input-with-suffix { display:flex; align-items:center; border:1px solid #e2e8e1; border-radius:7px; overflow:hidden; }.input-with-prefix:focus-within,.input-with-suffix:focus-within { border-color:#76a583; box-shadow:0 0 0 3px #eaf3ec; }.input-with-prefix>span,.input-with-suffix>span { padding:0 11px; color:#92a098; font-size:12px; }.panel .input-with-prefix input,.panel .input-with-suffix input { border:0; border-radius:0; box-shadow:none; }.field-error { display:block; margin-top:4px; color:#bd5b50; font-size:10px; }
    .primary-button { border:0; border-radius:7px; padding:12px 14px; background:#397b52; color:white; font:inherit; font-size:12px; font-weight:700; cursor:pointer; transition:background .15s,transform .15s; }.primary-button:hover:not(:disabled) { background:#2d6844; transform:translateY(-1px); }.primary-button:disabled { opacity:.58; cursor:wait; }.full-button { width:100%; display:flex; justify-content:space-between; align-items:center; margin-top:22px; }.full-button span { font-size:16px; }
    .list-panel { padding:24px 0 0; min-height:380px; overflow:hidden; }.list-heading { padding:0 23px 18px; }.count { display:inline-grid; place-items:center; vertical-align:3px; min-width:21px; height:21px; border-radius:7px; margin-left:4px; background:#eff4ee; color:#618069; font-size:10px; letter-spacing:0; }.icon-button { border:1px solid #e7ece5; width:31px; height:31px; border-radius:8px; background:white; color:#718078; font-size:18px; cursor:pointer; }.table-wrap { width:100%; overflow:auto; } table { border-collapse:collapse; width:100%; text-align:left; white-space:nowrap; } thead { background:#f8faf7; } th { padding:11px 15px; color:#98a198; font-size:9px; letter-spacing:.8px; font-weight:800; } th:first-child,td:first-child { padding-left:23px; } td { border-top:1px solid #f0f2ef; padding:13px 15px; color:#56665b; font-size:11px; }.person { display:flex; align-items:center; gap:9px; }.person strong,.person small { display:block; }.person strong { color:#34483b; font-size:11px; }.person small { max-width:180px; overflow:hidden; text-overflow:ellipsis; color:#98a198; font-size:10px; margin-top:3px; }.avatar { display:grid; place-items:center; width:31px; height:31px; border-radius:10px; background:#e9f1e9; color:#4b7a54; font-size:10px; font-weight:800; }.muted-cell { color:#839088; }.rate-cell { color:#4c7554; font-weight:700; }.list-footnote { margin:0; border-top:1px solid #f0f2ef; padding:13px 23px; color:#9aa49c; font-size:10px; }.empty-state { display:flex; min-height:240px; flex-direction:column; align-items:center; justify-content:center; color:#8c9990; text-align:center; }.empty-state p { margin:7px 0 0; font-size:11px; }.empty-state strong { margin-top:9px; color:#596b5f; font-size:12px; }.empty-icon { display:grid; place-items:center; width:43px; height:43px; border-radius:13px; background:#f2f6f1; color:#73927b; font-size:20px; }.loader { width:23px; height:23px; border:2px solid #e5eee5; border-top-color:#4a855b; border-radius:50%; animation:spin .7s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
    .notice { display:flex; align-items:center; gap:9px; margin:0 0 15px; padding:11px 13px; border:1px solid #d8eadb; border-radius:8px; background:#f0f8f0; color:#3c704a; font-size:12px; }.notice>span { font-weight:800; }.notice button { margin-left:auto; border:0; background:none; color:inherit; font-size:19px; cursor:pointer; }.notice.error { border-color:#f0d9d6; background:#fff4f2; color:#a84d43; }
    .single-panel-wrap { display:flex; justify-content:center; }.narrow-panel { box-sizing:border-box; width:min(100%,560px); padding:27px 30px; }.narrow-panel form label { margin-top:17px; }.two-fields { display:grid; grid-template-columns:1fr 1fr; gap:13px; }.inline-note { padding:10px 12px; border-radius:7px; background:#f8f4e8; color:#90793a; font-size:11px; }.billing-layout { display:grid; grid-template-columns:minmax(280px,.9fr) minmax(0,1.25fr); gap:17px; align-items:stretch; }.bill-filter { padding:26px; }.bill-filter form label { margin-top:16px; }.bill-card { position:relative; overflow:hidden; min-height:355px; padding:28px 31px; border-radius:13px; background:#edf4eb; color:#2c4635; }.bill-card:after { position:absolute; content:""; width:210px; height:210px; right:-88px; top:-110px; border-radius:50%; background:#dfeadd; }.bill-top { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }.bill-icon { display:grid; place-items:center; width:35px; height:35px; border:1px solid #d6e4d5; border-radius:10px; color:#49805a; }.bill-period { padding:7px 11px; border-radius:20px; background:#fff9; color:#66806c; font-size:10px; font-weight:700; }.bill-card .eyebrow { margin-bottom:6px; color:#7f9681; }.bill-card h2 { margin:0; font-size:22px; letter-spacing:-.5px; }.bill-subtitle { margin:6px 0 18px; color:#839487; font-size:11px; }.bill-divider { height:1px; background:#dce8da; margin:16px 0; }.bill-line { display:flex; justify-content:space-between; align-items:center; padding:9px 0; color:#758679; font-size:12px; }.bill-line strong { color:#415c48; font-size:13px; }.bill-line small { color:#91a192; font-size:10px; }.bill-total { display:flex; justify-content:space-between; align-items:center; margin-top:9px; padding:16px; border:1px solid #dce8da; border-radius:9px; background:#ffffffa8; color:#59705e; font-size:12px; }.bill-total strong { color:#2e6844; font-size:21px; }.bill-caption { margin:12px 0 0; color:#94a095; text-align:center; font-size:9px; }.bill-empty { display:grid; place-items:center; background:#f0f3ec; text-align:center; }.bill-placeholder { max-width:270px; }.placeholder-icon { display:grid; place-items:center; margin:0 auto 18px; width:46px; height:46px; border-radius:14px; background:#e3ecdf; color:#66816a; font-size:22px; }.bill-placeholder h2 { color:#344a38; font-size:21px; }.bill-placeholder p { color:#849087; font-size:12px; line-height:1.6; }.placeholder-rule { width:35px; height:2px; margin:22px auto; background:#becfba; }.secure-label { color:#94a191; font-size:8px; font-weight:800; letter-spacing:1.1px; }
    footer { display:flex; justify-content:space-between; padding:25px 2px 7px; color:#a0aaa1; font-size:10px; }.single-panel-wrap+footer { margin-top:0; }
    @media (max-width:760px) { .content { padding-top:30px; }.workspace-grid,.billing-layout { grid-template-columns:1fr; }.stats { grid-template-columns:1fr 1fr; }.stat-tip { grid-column:1/-1; }.list-panel { min-height:280px; }.date-chip { font-size:10px; }.intro { align-items:flex-start; gap:12px; flex-direction:column; } }
    @media (max-width:470px) { .topbar { height:58px; padding:0 17px; }.content { padding:25px 15px 18px; }.stats { gap:8px; }.stat-card { padding:12px 11px; gap:9px; }.stat-icon { width:32px;height:32px; }.stat-card strong { font-size:15px; }.tip-text { font-size:11px!important; }.tabs { width:100%; box-sizing:border-box; justify-content:space-between; }.tabs button { padding:9px 10px; font-size:10px; }.form-panel,.narrow-panel,.bill-filter { padding:20px; }.bill-card { padding:23px 20px; }.two-fields { gap:9px; } }
  `]
})
export class AppComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CustomerService);

  readonly today = new Date();
  readonly months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  readonly customerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9() .-]{7,30}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    milkRatePerLiter: [0, [Validators.required, Validators.min(0.01)]]
  });
  readonly entryForm = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    date: [this.toDateInputValue(new Date()), Validators.required],
    liters: [0, [Validators.required, Validators.min(0.01)]]
  });
  readonly billingForm = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1), Validators.max(9999)]],
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]]
  });

  customers: Customer[] = [];
  activeTab: Tab = 'customers';
  bill: MonthlyBill | null = null;
  notice = '';
  noticeType: 'success' | 'error' = 'success';
  loadingCustomers = false;
  savingCustomer = false;
  savingEntry = false;
  loadingBill = false;

  ngOnInit(): void { this.loadCustomers(); }

  setTab(tab: Tab): void { this.activeTab = tab; this.notice = ''; }

  loadCustomers(): void {
    this.loadingCustomers = true;
    this.api.getCustomers().subscribe({
      next: customers => { this.customers = customers; this.loadingCustomers = false; },
      error: error => { this.loadingCustomers = false; this.showError(error, 'Could not load customers. Check that the API is running.'); }
    });
  }

  addCustomer(): void {
    if (this.customerForm.invalid) { this.customerForm.markAllAsTouched(); return; }
    this.savingCustomer = true;
    this.api.createCustomer(this.customerForm.getRawValue()).subscribe({
      next: customer => {
        this.customers = [...this.customers, customer];
        this.customerForm.reset({ name: '', phone: '', address: '', milkRatePerLiter: 0 });
        this.savingCustomer = false;
        this.showSuccess(`${customer.name} was added to your customer list.`);
      },
      error: error => { this.savingCustomer = false; this.showError(error, 'Could not save customer. Please try again.'); }
    });
  }

  addEntry(): void {
    if (this.entryForm.invalid) { this.entryForm.markAllAsTouched(); return; }
    const form = this.entryForm.getRawValue();
    this.savingEntry = true;
    this.api.createMilkEntry({ customerId: Number(form.customerId), date: form.date, liters: Number(form.liters) }).subscribe({
      next: () => {
        this.savingEntry = false;
        this.showSuccess('Delivery entry saved successfully.');
        this.entryForm.patchValue({ liters: 0 });
      },
      error: error => { this.savingEntry = false; this.showError(error, 'Could not save delivery. Please try again.'); }
    });
  }

  fetchBill(): void {
    if (this.billingForm.invalid) { this.billingForm.markAllAsTouched(); return; }
    const form = this.billingForm.getRawValue();
    this.loadingBill = true;
    this.bill = null;
    this.api.getMonthlyBill(Number(form.customerId), Number(form.year), Number(form.month)).subscribe({
      next: bill => { this.bill = bill; this.loadingBill = false; this.showSuccess('Monthly bill calculated.'); },
      error: error => { this.loadingBill = false; this.showError(error, 'Could not calculate this bill. Please try again.'); }
    });
  }

  invalid(form: AbstractControl, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
  }

  customerName(customerId: number): string {
    return this.customers.find(customer => customer.id === customerId)?.name ?? `Customer #${customerId}`;
  }

  trackCustomer(_index: number, customer: Customer): number { return customer.id; }

  private showSuccess(message: string): void { this.noticeType = 'success'; this.notice = message; }

  private showError(error: unknown, fallback: string): void {
    const response = error as HttpErrorResponse;
    const detail = response?.error?.detail;
    this.noticeType = 'error';
    this.notice = typeof detail === 'string' ? detail : fallback;
  }

  private toDateInputValue(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }
}
