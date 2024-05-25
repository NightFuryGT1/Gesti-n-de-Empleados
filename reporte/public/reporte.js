document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const searchBox = document.getElementById('searchBox');
    const departmentFilter = document.getElementById('departmentFilter');
    const recordsPerPage = document.getElementById('recordsPerPage');
    const employeeList = document.getElementById('employeeList');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const generateIndividualPdfBtn = document.getElementById('generateIndividualPdfBtn');
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');
    let empleados = [];
    let currentPage = 1;
    let recordsToShow = 10;

    const fetchEmployees = () => {
        fetch('/empleados')
            .then(response => response.json())
            .then(data => {
                empleados = data;
                renderEmployees();
            })
            .catch(error => console.error('Error fetching employees:', error));
    };

    const fetchDepartments = () => {
        fetch('/departamentos')
            .then(response => response.json())
            .then(data => {
                data.forEach(dept => {
                    const option = document.createElement('option');
                    option.value = dept;
                    option.textContent = dept;
                    departmentFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching departments:', error));
    };

    const renderEmployees = () => {
        const start = (currentPage - 1) * recordsToShow;
        const end = start + recordsToShow;
        const filteredEmpleados = empleados.slice(start, end);

        employeeList.innerHTML = '';
        filteredEmpleados.forEach(emp => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                <div class="row">
                    <div class="col">${emp.id_empleado}</div>
                    <div class="col">${emp.nombres}</div>
                    <div class="col">${emp.apellidos}</div>
                    <div class="col">${emp.nombre_cargo}</div>
                    <div class="col">${emp.nombre_departamento}</div>
                    <div class="col">
                        <i class="eye-icon fa fa-eye" data-toggle="modal" data-target="#employeeModal" data-id="${emp.id_empleado}"></i>
                    </div>
                </div>
            `;
            employeeList.appendChild(li);
        });
    };

    const updatePagination = () => {
        const totalPages = Math.ceil(empleados.length / recordsToShow);
        firstPageBtn.disabled = currentPage === 1;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        lastPageBtn.disabled = currentPage === totalPages;
    };

    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();
        empleados = empleados.filter(emp =>
            emp.nombres.toLowerCase().includes(searchTerm) ||
            emp.apellidos.toLowerCase().includes(searchTerm) ||
            emp.nombre_cargo.toLowerCase().includes(searchTerm) ||
            emp.nombre_departamento.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        renderEmployees();
        updatePagination();
    });

    departmentFilter.addEventListener('change', () => {
        const selectedDept = departmentFilter.value;
        if (selectedDept === 'todos') {
            fetchEmployees();
        } else {
            empleados = empleados.filter(emp => emp.nombre_departamento === selectedDept);
        }
        currentPage = 1;
        renderEmployees();
        updatePagination();
    });

    recordsPerPage.addEventListener('change', () => {
        recordsToShow = parseInt(recordsPerPage.value, 10);
        currentPage = 1;
        renderEmployees();
        updatePagination();
    });

    generatePdfBtn.addEventListener('click', () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(10);

        const columns = ["ID", "Nombre", "Apellido", "Cargo", "Departamento", "Salario Base", "Bonificaciones", "Deducciones", "Salario Neto"];
        const rows = empleados.map(emp => [
            emp.id_empleado, emp.nombres, emp.apellidos, emp.nombre_cargo, emp.nombre_departamento, 'Q. '+emp.salario_base, 'Q. '+emp.bonificaciones, 'Q. '+emp.deducciones, 'Q. '+emp.salario_neto
        ]);

        doc.autoTable({ head: [columns], body: rows, startY: 10 });
        doc.save('reporte_nomina.pdf');
    });

    $('#employeeModal').on('show.bs.modal', (event) => {
        const button = $(event.relatedTarget);
        const idEmpleado = button.data('id');
        const empleado = empleados.find(emp => emp.id_empleado === idEmpleado);
        if (empleado) {
            $('.modal-body').html(`
                <p><strong>ID:</strong> ${empleado.id_empleado}</p>
                <p><strong>Nombre:</strong> ${empleado.nombres} ${empleado.apellidos}</p>
                <p><strong>Fecha de Nacimiento:</strong> ${empleado.fecha_nacimiento}</p>
                <p><strong>Fecha de Ingreso:</strong> ${empleado.fecha_ingreso}</p>
                <p><strong>Dirección:</strong> ${empleado.direccion}</p>
                <p><strong>Género:</strong> ${empleado.genero}</p>
                <p><strong>DPI:</strong> ${empleado.dpi}</p>
                <p><strong>Teléfono:</strong> ${empleado.telefono}</p>
                <p><strong>Correo Electrónico:</strong> ${empleado.correo_electronico}</p>
                <p><strong>Departamento:</strong> ${empleado.nombre_departamento}</p>
                <p><strong>Cargo:</strong> ${empleado.nombre_cargo}</p>
                <p><strong>Salario Base:</strong> Q. ${empleado.salario_base}</p>
                <p><strong>Bonificaciones:</strong> Q. ${empleado.bonificaciones}</p>
                <p><strong>Deducciones:</strong> Q. ${empleado.deducciones}</p>
                <p><strong>Salario Neto:</strong> Q. ${empleado.salario_neto}</p>
            `);
            generateIndividualPdfBtn.onclick = () => {
                const doc = new jsPDF('portrait');
                doc.setFontSize(12);
                const pageWidth = doc.internal.pageSize.getWidth();
                const centerX = pageWidth / 2;
                const margin = 20;
                const lineSpacing = 10;

                // Add logo if needed
                // doc.addImage('path/to/logo.png', 'PNG', margin, margin, 50, 15);

                doc.text('Reporte de Empleado', centerX, margin, { align: 'center' });
                doc.setFontSize(10);
                doc.text(`ID: ${empleado.id_empleado}`, margin, margin + 2 * lineSpacing);
                doc.text(`Nombre: ${empleado.nombres} ${empleado.apellidos}`, margin, margin + 3 * lineSpacing);
                doc.text(`Fecha de Nacimiento: ${empleado.fecha_nacimiento}`, margin, margin + 4 * lineSpacing);
                doc.text(`Fecha de Ingreso: ${empleado.fecha_ingreso}`, margin, margin + 5 * lineSpacing);
                doc.text(`Dirección: ${empleado.direccion}`, margin, margin + 6 * lineSpacing);
                doc.text(`Género: ${empleado.genero}`, margin, margin + 7 * lineSpacing);
                doc.text(`DPI: ${empleado.dpi}`, margin, margin + 8 * lineSpacing);
                doc.text(`Teléfono: ${empleado.telefono}`, margin, margin + 9 * lineSpacing);
                doc.text(`Correo Electrónico: ${empleado.correo_electronico}`, margin, margin + 10 * lineSpacing);
                doc.text(`Departamento: ${empleado.nombre_departamento}`, margin, margin + 11 * lineSpacing);
                doc.text(`Cargo: ${empleado.nombre_cargo}`, margin, margin + 12 * lineSpacing);
                doc.text(`Salario Base: Q. ${empleado.salario_base}`, margin, margin + 13 * lineSpacing);
                doc.text(`Bonificaciones: Q. ${empleado.bonificaciones}`, margin, margin + 14 * lineSpacing);
                doc.text(`Deducciones: Q. ${empleado.deducciones}`, margin, margin + 15 * lineSpacing);
                doc.text(`Salario Neto: Q. ${empleado.salario_neto}`, margin, margin + 16 * lineSpacing);

                doc.save(`${empleado.nombres}_${empleado.apellidos}.pdf`);
            };
        }
    });

    firstPageBtn.addEventListener('click', () => {
        currentPage = 1;
        renderEmployees();
        updatePagination();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEmployees();
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(empleados.length / recordsToShow);
        if (currentPage < totalPages) {
            currentPage++;
            renderEmployees();
            updatePagination();
        }
    });

    lastPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(empleados.length / recordsToShow);
        currentPage = totalPages;
        renderEmployees();
        updatePagination();
    });

    fetchEmployees();
    fetchDepartments();
});
