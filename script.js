// データ管理
class TravelApp {
    constructor() {
        this.trips = this.loadTrips();
        this.schedules = this.loadSchedules();
        this.currentTripId = null;
        this.init();
    }

    // 初期化
    init() {
        this.setupEventListeners();
        this.renderTrips();
    }

    // イベントリスナー設定
    setupEventListeners() {
        document.getElementById('tripForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTrip();
        });

        document.getElementById('scheduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSchedule();
        });
    }

    // 旅行を追加
    addTrip() {
        const tripName = document.getElementById('tripName').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const destination = document.getElementById('destination').value;

        // バリデーション
        if (!tripName || !startDate || !endDate || !destination) {
            alert('すべてのフィールドを入力してください');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            alert('開始日は終了日より前である必要があります');
            return;
        }

        const trip = {
            id: Date.now(),
            name: tripName,
            startDate: startDate,
            endDate: endDate,
            destination: destination,
            createdAt: new Date().toISOString()
        };

        this.trips.push(trip);
        this.saveTrips();
        this.renderTrips();
        document.getElementById('tripForm').reset();
        alert('旅行を追加しました！');
    }

    // 旅行を削除
    deleteTrip(id) {
        if (confirm('この旅行を削除してもよろしいですか？')) {
            this.trips = this.trips.filter(trip => trip.id !== id);
            this.schedules = this.schedules.filter(schedule => schedule.tripId !== id);
            this.saveTrips();
            this.saveSchedules();
            this.renderTrips();
            alert('旅行を削除しました');
        }
    }

    // 旅行を編集
    editTrip(id) {
        const trip = this.trips.find(t => t.id === id);
        if (!trip) return;

        // フォームに値を入力
        document.getElementById('tripName').value = trip.name;
        document.getElementById('startDate').value = trip.startDate;
        document.getElementById('endDate').value = trip.endDate;
        document.getElementById('destination').value = trip.destination;

        // 古い旅行を削除して新しい旅行として追加
        this.deleteTrip(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 旅行一覧をレンダリング
    renderTrips() {
        const tripsList = document.getElementById('tripsList');

        if (this.trips.length === 0) {
            tripsList.innerHTML = '<p class="empty-message">まだ旅行が登録されていません</p>';
            return;
        }

        tripsList.innerHTML = this.trips.map(trip => {
            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.endDate);
            const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            return `
                <div class="trip-card">
                    <h3>${trip.name}</h3>
                    <p>🌍 ${trip.destination}</p>
                    <div class="trip-card-info">
                        <p>📅 ${this.formatDate(trip.startDate)} ～ ${this.formatDate(trip.endDate)}</p>
                        <p>⏱️ ${days}日間の旅</p>
                    </div>
                    <div class="trip-card-actions">
                        <button class="btn btn-edit" onclick="app.viewSchedule(${trip.id})">スケジュール</button>
                        <button class="btn btn-edit" onclick="app.editTrip(${trip.id})">編集</button>
                        <button class="btn btn-danger" onclick="app.deleteTrip(${trip.id})">削除</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // スケジュール画面を表示
    viewSchedule(tripId) {
        this.currentTripId = tripId;
        const trip = this.trips.find(t => t.id === tripId);
        document.getElementById('scheduleTitle').textContent = `${trip.name} - スケジュール詳細`;
        document.getElementById('scheduleDate').value = trip.startDate;
        document.getElementById('scheduleDate').min = trip.startDate;
        document.getElementById('scheduleDate').max = trip.endDate;

        document.getElementById('scheduleSection').style.display = 'block';
        this.renderSchedules(tripId);
        window.scrollTo({ top: document.getElementById('scheduleSection').offsetTop, behavior: 'smooth' });
    }

    // 日程を追加
    addSchedule() {
        if (!this.currentTripId) {
            alert('旅行を選択してください');
            return;
        }

        const scheduleDate = document.getElementById('scheduleDate').value;
        const scheduleTime = document.getElementById('scheduleTime').value;
        const activity = document.getElementById('activity').value;
        const memo = document.getElementById('memo').value;

        if (!scheduleDate || !activity) {
            alert('日付とアクティビティは必須です');
            return;
        }

        const schedule = {
            id: Date.now(),
            tripId: this.currentTripId,
            date: scheduleDate,
            time: scheduleTime || '未定',
            activity: activity,
            memo: memo,
            createdAt: new Date().toISOString()
        };

        this.schedules.push(schedule);
        this.saveSchedules();
        this.renderSchedules(this.currentTripId);
        document.getElementById('scheduleForm').reset();
        alert('日程を追加しました！');
    }

    // 日程を削除
    deleteSchedule(id) {
        if (confirm('この日程を削除してもよろしいですか？')) {
            this.schedules = this.schedules.filter(schedule => schedule.id !== id);
            this.saveSchedules();
            this.renderSchedules(this.currentTripId);
            alert('日程を削除しました');
        }
    }

    // スケジュール一覧をレンダリング
    renderSchedules(tripId) {
        const scheduleList = document.getElementById('scheduleList');
        const tripSchedules = this.schedules
            .filter(schedule => schedule.tripId === tripId)
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA.getTime() === dateB.getTime()) {
                    return a.time.localeCompare(b.time);
                }
                return dateA - dateB;
            });

        if (tripSchedules.length === 0) {
            scheduleList.innerHTML = '<p class="empty-message">スケジュールがまだ登録されていません</p>';
            return;
        }

        scheduleList.innerHTML = tripSchedules.map(schedule => `
            <div class="schedule-item">
                <div class="schedule-item-content">
                    <h4>${schedule.activity}</h4>
                    <p>📅 ${this.formatDate(schedule.date)} ${schedule.time !== '未定' ? `⏰ ${schedule.time}` : ''}</p>
                    ${schedule.memo ? `<p>📝 ${schedule.memo}</p>` : ''}
                </div>
                <div class="schedule-item-actions">
                    <button class="btn btn-danger" onclick="app.deleteSchedule(${schedule.id})">削除</button>
                </div>
            </div>
        `).join('');
    }

    // ローカルストレージからデータ読み込み
    loadTrips() {
        const data = localStorage.getItem('trips');
        return data ? JSON.parse(data) : [];
    }

    loadSchedules() {
        const data = localStorage.getItem('schedules');
        return data ? JSON.parse(data) : [];
    }

    // ローカルストレージにデータ保存
    saveTrips() {
        localStorage.setItem('trips', JSON.stringify(this.trips));
    }

    saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }

    // 日付をフォーマット
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
    }
}

// スケジュール画面を閉じる
function closeScheduleForm() {
    document.getElementById('scheduleSection').style.display = 'none';
    app.currentTripId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// アプリ初期化
const app = new TravelApp();
