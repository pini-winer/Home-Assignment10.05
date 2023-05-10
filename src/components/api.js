import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Api.css';
import UserDetails from './userDetails';

const Api = () => {
    const [users, setUsers] = useState([]);
    const [numberOfRows, setNumberOfRows] = useState(10);
    const [editingCell, setEditingCell] = useState(null);
    const [upgradedValues, setUpgradedValues] = useState(() => {
        const storedValues = localStorage.getItem('upgradedValues');
        return storedValues ? JSON.parse(storedValues) : {};
    });
    const [deletedUsers, setDeletedUsers] = useState(() => {
        const storedDeletedUsers = localStorage.getItem('deletedUsers');
        return storedDeletedUsers ? JSON.parse(storedDeletedUsers) : [];
    });
    const [selectedUser, setSelected] = useState(null);



    useEffect(() => {
        async function fetchData() {
            try {

                const response = await axios.get(`https://randomuser.me/api/?page=3&results=${numberOfRows}&seed=foobar`);
                setUsers(response.data.results);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, [numberOfRows]);


    useEffect(() => {
        localStorage.setItem('upgradedValues', JSON.stringify(upgradedValues));
    }, [upgradedValues]);



    useEffect(() => {
        localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
    }, [deletedUsers]);

    const handleSelectRows = e => {
        setNumberOfRows(e.target.value);
    };



    const handleEdit = () => {
        const updatedUsers = users.map(user => {

            let value = editingCell.value;
            let field = editingCell.field;
            let id = editingCell.id;
            let newValue;
            if (user.login.uuid === id) {
                if (field === 'first') {
                    newValue = { ...user.name, first: value };
                } else if (field === 'last') {
                    newValue = { ...user.name, last: value };
                } else {
                    newValue = { ...user, [field]: value }
                }
                setUpgradedValues(prevValues => ({ ...prevValues, [id]: { ...prevValues[id], [field]: value } }));
                return { ...user, ...newValue };
            }
            return user;
        });
        console.log(editingCell)
        setUsers(updatedUsers);

    };

    const handleCellClick = (id, field, value) => {

        setEditingCell({ id, field, value });

    };

    const handleCellChange = e => {

        setEditingCell({ ...editingCell, value: e.target.value });

    };

    const handleCellKeyDown = e => {
        if (e.key === 'Enter') {
            
            handleEdit(editingCell.id, editingCell.field, editingCell.value);

        }

    };



    const handleDelete = id => {
        const updatedUsers = users.filter(user => user.login.uuid !== id);
        setUsers(updatedUsers);
        setDeletedUsers(prevDeletedUsers => [...prevDeletedUsers, id]);
    };

    const getDisplayed = () => {
        const deletedUserIds = new Set(deletedUsers);
        const displayedUsers = users.filter(user => !deletedUserIds.has(user.login.uuid));
        const upgradedUsers = displayedUsers.map(user => {
            const upgradedFields = upgradedValues[user.login.uuid] || {};
            return { ...user, ...upgradedFields };
        });
        return upgradedUsers;
    };

    return (
        <div>
            <select value={numberOfRows} onChange={handleSelectRows}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
            </select>
            <table>
                <thead>
                    <tr>
                        <th>SN</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {getDisplayed().map((user, index) => (
                        <tr key={user.login.uuid}>
                            <td onClick={() => setSelected(user)}>{index + 1}</td>

                            <td onDoubleClick={() => handleCellClick(user.login.uuid, 'first', user.name.first)}>
                                {editingCell?.id === user.login.uuid && editingCell?.field === 'first' ? (
                                    <input type="text" value={editingCell.value} onChange={handleCellChange} />)
                                    : (user.name.first)}
                            </td>
                            <td onDoubleClick={() => handleCellClick(user.login.uuid, 'last', user.name.last)}>
                                {editingCell?.id === user.login.uuid && editingCell?.field === 'last' ? (
                                    <input type="text" value={editingCell.value} onChange={handleCellChange} />)
                                    : (user.name.last)}
                            </td>
                            <td onDoubleClick={() => handleCellClick(user.login.uuid, 'email', user.email)}>
                                {editingCell?.id === user.login.uuid && editingCell?.field === 'email' ? (
                                    <input type="text" value={editingCell.value} onChange={handleCellChange} onKeyDown={handleCellKeyDown} />)
                                    : (user.email)}
                            </td>
                            <td onDoubleClick={() => handleCellClick(user.login.uuid, 'phone', user.phone)}>
                                {editingCell?.id === user.login.uuid && editingCell?.field === 'phone' ? (
                                    <input type="text" value={editingCell.value} onChange={handleCellChange} onKeyDown={handleCellKeyDown} />)
                                    : (user.phone)}
                            </td>

                            <td>{user.gender}</td>
                            <td><button onClick={() => handleEdit(user.login.uuid)}>Upgrade</button></td>
                            <td><button onClick={() => handleDelete(user.login.uuid)}>Delete</button></td>


                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Api;