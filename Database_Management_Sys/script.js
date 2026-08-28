const recordsBody = document.querySelector('#records-body');
const dialog = document.querySelector('#record-dialog');
const recordForm = document.querySelector('#record-form');
const formFields = [...recordForm.querySelectorAll('input')];
const dialogKicker = document.querySelector('#dialog-kicker');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const confirmButton = document.querySelector('#confirm-button');

let activeOperation = '';
let currentLoadedRecords = [];

async function fetchRecords() {
    try {
        const response = await fetch('/api/student_record');
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function renderRecords() {
    currentLoadedRecords = await fetchRecords();
    if (!currentLoadedRecords || currentLoadedRecords.length === 0) {
        recordsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6);">No student records found in database</td></tr>`;
        return;
    }
    recordsBody.innerHTML = currentLoadedRecords.map((record, index) => `
        <tr>
            <td>${String(index + 1).padStart(2, '0')}</td>
            <td>${record.name}</td>
            <td>${record.course}</td>
            <td>${record.branch}</td>
            <td>${record.rollno}</td>
        </tr>
    `).join('');
}

function setFieldVisibility(operation) {
    const onlySrno = operation === 'retrieve' || operation === 'delete';

    formFields.forEach((field) => {
        const fieldLabel = field.closest('label');
        const isSrno = field.name === 'srno';
        const isRollno = field.name === 'rollno';

        fieldLabel.hidden = onlySrno && !isSrno;

        if (operation === 'create') {
            field.required = !isSrno && !isRollno;
        } else if (operation === 'update') {
            field.required = !isRollno;
        } else if (onlySrno) {
            field.required = isSrno;
        }
    });
}

function openDialog(operation) {
    activeOperation = operation;
    recordForm.reset();
    setFieldVisibility(operation);

    const labels = {
        create: ['Create record', 'Add student', 'Enter details. Rollno is auto-generated if left empty.', 'Save record'],
        update: ['Update record', 'Edit student', 'Enter Sr no. and updated details.', 'Update record'],
        retrieve: ['Retrieve record', 'Find student', 'Enter serial number (Sr no.) to find a student.', 'Find record'],
        delete: ['Delete record', 'Remove student', 'Enter serial number (Sr no.) to remove a student.', 'Delete record']
    };

    [dialogKicker.textContent, dialogTitle.textContent, dialogDescription.textContent, confirmButton.textContent] = labels[operation];
    dialog.showModal();
    const firstVisibleInput = formFields.find(f => !f.closest('label').hidden);
    if (firstVisibleInput) firstVisibleInput.focus();
}

function getFormRecord() {
    const formData = new FormData(recordForm);

    return {
        srno: formData.get('srno') ? Number(formData.get('srno')) : null,
        name: String(formData.get('name') || '').trim(),
        course: String(formData.get('course') || '').trim(),
        branch: String(formData.get('branch') || '').trim(),
        rollno: String(formData.get('rollno') || '').trim()
    };
}

function findRecordBySrNo(inputSrNo) {
    if (!inputSrNo) return null;
    // Check by row index (1-based displayed Sr No)
    if (inputSrNo >= 1 && inputSrNo <= currentLoadedRecords.length) {
        return { record: currentLoadedRecords[inputSrNo - 1], displayIndex: inputSrNo };
    }
    // Fallback: check by database srno
    const match = currentLoadedRecords.find(r => Number(r.srno) === inputSrNo);
    if (match) {
        const idx = currentLoadedRecords.indexOf(match);
        return { record: match, displayIndex: idx + 1 };
    }
    return null;
}

function showToast(message, type = 'success') {
    let container = document.querySelector('#toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    const icon = iconMap[type] || 'ℹ';

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

document.querySelectorAll('.operation-card').forEach((card) => {
    card.addEventListener('submit', (event) => {
        event.preventDefault();
        const action = card.getAttribute('action');
        openDialog(action === 'insert' ? 'create' : action);
    });
});

recordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (event.submitter?.classList.contains('close-dialog') || event.submitter?.classList.contains('cancel-button')) {
        dialog.close();
        return;
    }

    const formRecord = getFormRecord();

    try {
        if (activeOperation === 'create') {
            const res = await fetch('/api/student_record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formRecord)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to create record');
            showToast(`Student record added successfully! Roll No: ${result.rollno}`, 'success');
        }

        else if (activeOperation === 'update') {
            if (!formRecord.srno) {
                showToast('Please enter a valid serial number (Sr no.)', 'error');
                return;
            }
            const matchInfo = findRecordBySrNo(formRecord.srno);
            if (!matchInfo) {
                showToast(`No record found at Sr no. ${formRecord.srno}`, 'error');
                return;
            }
            const targetDbSrNo = matchInfo.record.srno;
            const res = await fetch(`/api/student_record/${targetDbSrNo}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formRecord)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to update record');
            showToast('Student record updated successfully!', 'success');
        }

        else if (activeOperation === 'retrieve') {
            if (!formRecord.srno) {
                showToast('Please enter a valid serial number (Sr no.)', 'error');
                return;
            }
            const matchInfo = findRecordBySrNo(formRecord.srno);
            if (!matchInfo) {
                showToast(`No record found at Sr no. ${formRecord.srno}`, 'error');
                return;
            }
            const rec = matchInfo.record;
            const displaySrNo = String(matchInfo.displayIndex).padStart(2, '0');
            showToast(`Found Record (Sr ${displaySrNo}): ${rec.name} | ${rec.course} - ${rec.branch} | Roll: ${rec.rollno}`, 'info');
            dialog.close();
            return;
        }

        else if (activeOperation === 'delete') {
            if (!formRecord.srno) {
                showToast('Please enter a valid serial number (Sr no.)', 'error');
                return;
            }
            const matchInfo = findRecordBySrNo(formRecord.srno);
            if (!matchInfo) {
                showToast(`No record found at Sr no. ${formRecord.srno}`, 'error');
                return;
            }
            const targetDbSrNo = matchInfo.record.srno;
            const res = await fetch(`/api/student_record/${targetDbSrNo}`, {
                method: 'DELETE'
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to delete record');
            showToast('Student record deleted successfully!', 'success');
        }

        await renderRecords();
        dialog.close();
    } catch (err) {
        showToast(err.message, 'error');
    }
});

window.addEventListener('DOMContentLoaded', renderRecords);


